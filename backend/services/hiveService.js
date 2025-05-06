const axios = require('axios');

const createHiveCase = async (ticketData) => {
  try {
    const response = await axios.post(
      `${process.env.THEHIVE_URL}/api/case`,
      {
        title: ticketData.title,
        description: ticketData.description,
        severity: 2, // Medium severity
        tlp: 2, // Amber TLP
        tags: ['VOC-System'],
        flag: false,
        tasks: [
          {
            title: 'Investigate ticket',
            status: 'Waiting',
            description: 'Auto-generated investigation task'
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.THEHIVE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.id; // Return created case ID
  } catch (error) {
    if (error.response?.status === 429) { // Rate limiting
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(res => setTimeout(res, delay));
      retries++;
    } else {
      console.error('TheHive integration failed:', error.response?.data || error.message);
    }
  }
  return null;
};

module.exports = { createHiveCase };