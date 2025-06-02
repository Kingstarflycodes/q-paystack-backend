import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { customer_code } = req.body;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: customer_code'
    });
  }

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Check if a dedicated account already exists for the customer
    const existingRes = await axios.get('https://api.paystack.co/dedicated_account', { headers });

    const existingAccount = existingRes.data.data.find(
      acc => acc.customer.customer_code === customer_code
    );

    if (existingAccount) {
      return res.status(200).json({
        success: true,
        message: 'Dedicated account already exists for this customer',
        response: {
          data: {
            bank: existingAccount.bank,
            account_name: existingAccount.account_name,
            account_number: existingAccount.account_number,
            customer: existingAccount.customer,
            assigned: existingAccount.assigned,
            created_at: existingAccount.created_at
          }
        }
      });
    }

    // Create a new dedicated account with Paystack Titan bank
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: customer_code,
        preferred_bank: 'paystack' // Paystack Titan
      },
      { headers }
    );

    return res.status(200).json({
      success: true,
      message: 'Dedicated account created successfully',
      response: {
        data: response.data.data
      }
    });

  } catch (error) {
    console.error('Paystack Error:', error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to create or check dedicated account',
      error: error.response?.data?.message || error.message
    });
  }
}