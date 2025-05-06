import argparse
import json
import traceback
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
from gvm.errors import GvmError

def debug_print(title, content):
    print(f"\n🔍 [DEBUG] {title}:")
    print("-" * 50)
    print(content)
    print("-" * 50 + "\n")

def get_or_create_target(gmp, target_name, target_host, port_list_id):
    try:
        debug_print("TARGET SEARCH", f"Looking for target: {target_name}")
        targets_response = gmp.get_targets(filter_string=f'name="{target_name}"')
        debug_print("TARGET RESPONSE", targets_response)

        for t in targets_response.xpath('target'):
            existing_hosts = t.find('hosts').text.split(',')
            existing_port_list = t.find('port_list').get('id')
            if (sorted(existing_hosts) == sorted([target_host]) and 
                existing_port_list == port_list_id):
                debug_print("EXISTING TARGET FOUND", t.get('id'))
                return t.get('id')

        debug_print("CREATING NEW TARGET", f"Name: {target_name}, Host: {target_host}")
        response = gmp.create_target(
            name=target_name,
            hosts=[target_host],
            port_list_id=port_list_id
        )
        debug_print("NEW TARGET CREATED", response)
        return response.get('id')

    except Exception as e:
        debug_print("TARGET ERROR", f"{str(e)}\n{traceback.format_exc()}")
        raise

def start_scan_now(args):
    try:
        # 1. Connect to GVM using TLS
        debug_print("TLS CONNECTION", f"Connecting to {args.gvm_host}:{args.gvm_port}")
        connection = TLSConnection(
            hostname=args.gvm_host,
            port=args.gvm_port,
            certfile='./gvm-certs/stunnel.pem'
        )
        debug_print("TLS STATUS", "TLS connection established successfully")

        transform = EtreeTransform()
        with Gmp(connection=connection, transform=transform) as gmp:
            debug_print("GMP PROTOCOL", "GMP session initialized")

            # 2. Authenticate with GVM
            debug_print("AUTHENTICATION", f"Attempting auth as {args.gvm_user}")
            try:
                gmp.authenticate(args.gvm_user, args.gvm_password)
                debug_print("AUTH STATUS", "Authentication successful")
            except GvmError as e:
                debug_print("AUTH FAILED", f"GVM returned: {e}")
                raise

            # 3. Target management
            debug_print("TARGET STAGE", f"Processing target: {args.target_name}")
            target_id = get_or_create_target(gmp, args.target_name, args.target_host, args.port_list)
            debug_print("TARGET ID", target_id)

            # 4. Create and start scan task
            debug_print("TASK CREATION", "Creating scan task")
            task_response = gmp.create_task(
                name=f"Scan_{args.target_name}",
                config_id=args.scan_config,
                target_id=target_id,
                scanner_id=args.scanner_id
            )
            task_id = task_response.get('id')
            debug_print("TASK CREATED", task_response)

            debug_print("TASK START", f"Starting task {task_id}")
            start_response = gmp.start_task(task_id)
            debug_print("TASK STARTED", start_response)

            return {
                "status": "success",
                "task_id": task_id,
                "target_id": target_id,
                "message": f"Scan started for {args.target_name}"
            }

    except Exception as e:
        error_trace = traceback.format_exc()
        debug_print("FATAL ERROR", f"{str(e)}\n\nFull trace:\n{error_trace}")
        return {
            "status": "error",
            "message": str(e),
            "trace": error_trace
        }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Start GVM scan via TLS')

    # TLS connection to GVM
    parser.add_argument('--gvm-host', required=True, help='GVM TLS host (e.g., Kali VM IP)')
    parser.add_argument('--gvm-port', type=int, default=9390, help='GVM TLS port (default: 9390)')

    # GVM Authentication
    parser.add_argument('--gvm-user', required=True, help='GVM username')
    parser.add_argument('--gvm-password', required=True, help='GVM password')

    # Scan Parameters
    parser.add_argument('--target-name', required=True, help='Target name')
    parser.add_argument('--target-host', required=True, help='Target IP/hostname')
    parser.add_argument('--scan-config', default='daba56c8-73ec-11df-a475-002264764cea',
                        help='Scan config UUID (default: Full and fast)')
    parser.add_argument('--scanner-id', default='08b69003-5fc2-4037-a479-93b440211c73',
                        help='Scanner UUID (default: OpenVAS default)')
    parser.add_argument('--port-list', default='4a4717fe-57d2-11e1-9a26-406186ea4fc5',
                        help='Port list UUID (default: All IANA assigned TCP)')

    args = parser.parse_args()
    print("🚀 Starting TLS scan process with debug output...")
    result = start_scan_now(args)
    print("\n🎯 Final Result:")
    print(json.dumps(result, indent=2))