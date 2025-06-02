import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, first_name, last_name } = req.body;

  if (!email || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email, first_name, last_name'
    });
  }

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Check if customer already exists
    const existing = await axios.get(`https://api.paystack.co/customer/${email}`, { headers });

    const customer = existing.data.data;

    // If names are missing, update customer
    if (!customer.first_name || !customer.last_name) {
      await axios.put(
        `https://api.paystack.co/customer/${customer.customer_code}`,
        { first_name, last_name },
        { headers }
      );
    }

    return res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    // If customer does not exist, create new one
    if (error.response?.status === 404) {
      try {
        const response = await axios.post(
          'https://api.paystack.co/customer',
          { email, first_name, last_name },
          { headers }
        );

        return res.status(200).json({
          success: true,
          data: response.data.data
        });
      } catch (creationError) {
        console.error('Error creating customer:', creationError.response?.data || creationError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to create customer',
          error: creationError.response?.data?.message || 'Internal server error'
        });
      }
    }

    console.error('Error checking customer:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking customer',
      error: error.response?.data?.message || 'Internal server error'
    });
  }
}