import argparse
import json
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform

def get_or_create_target(gmp, target_name, target_host, port_list_id):
    # Filter targets by name
    targets_response = gmp.get_targets(filter_string=f'name="{target_name}"')
    
    for t in targets_response.xpath('target'):
        existing_hosts = t.find('hosts').text.split(',')
        existing_port_list = t.find('port_list').get('id')
        # Check if hosts and port list match
        if (sorted(existing_hosts) == sorted([target_host]) and 
            existing_port_list == port_list_id):
            return t.get('id')
    
    # Create new target if no match found
    response = gmp.create_target(
        name=target_name,
        hosts=[target_host],
        port_list_id=port_list_id
    )
    return response.get('id')

def start_scan_now(args):
    try:
        connection = TLSConnection(hostname=args.host, port=args.port)
        transform = EtreeTransform()

        with Gmp(connection, transform=transform) as gmp:
            gmp.authenticate(args.username, args.password)

            target_id = get_or_create_target(gmp, args.target_name, args.target_host, args.port_list)

            # Create task
            task_response = gmp.create_task(
                name=f"Scan_{args.target_name}",
                config_id=args.scan_config,
                target_id=target_id,
                scanner_id=args.scanner_id
            )
            task_id = task_response.get('id')

            # Start task
            gmp.start_task(task_id)

            return {
                "status": "success",
                "task_id": task_id,
                "target_id": target_id,
                "message": f"Scan started for {args.target_name}"
            }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Start immediate GVM scan')
    parser.add_argument('--host', required=True, help='GVM host')
    parser.add_argument('--port', type=int, default=9390, help='GVM port')
    parser.add_argument('--username', required=True, help='GVM username')
    parser.add_argument('--password', required=True, help='GVM password')
    parser.add_argument('--target_name', required=True, help='Target name')
    parser.add_argument('--target_host', required=True, help='Target host/ip')
    parser.add_argument('--scan_config', default='daba56c8-73ec-11df-a475-002264764cea', 
                      help='Scan config UUID (default: Full and fast)')
    parser.add_argument('--scanner_id', default='08b69003-5fc2-4037-a479-93b440211c73', 
                      help='Scanner UUID (default: OpenVAS default)')
    parser.add_argument('--port_list', default='4a4717fe-57d2-11e1-9a26-406186ea4fc5', 
                      help='Port list UUID (default: All IANA assigned TCP)')

    args = parser.parse_args()
    result = start_scan_now(args)
    print(json.dumps(result))