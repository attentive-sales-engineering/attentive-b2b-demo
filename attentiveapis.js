$(document).ready(function () {
  // Function to update localStorage
  function updateLocalStorage() {
      localStorage.setItem('firstName', firstNameElement.value);
      localStorage.setItem('lastName', lastNameElement.value);
      localStorage.setItem('email', emailElement.value);
      localStorage.setItem('phone', phoneElement.value);
      localStorage.setItem('title', titleElement.value);
      localStorage.setItem('companySize', companySizeElement.value);
      localStorage.setItem('Industry', industryElement.value);
      localStorage.setItem('smsOptIn', smsOptInElement.checked);
  }

  const attentiveAPIKey = 'MkR2eDNlSlp0Tnl2RTZ5MVJMT0t4bEl6TGdaWGp4VXpKR0Z4';
  const firstNameElement = document.querySelector('#firstName');
  const lastNameElement = document.querySelector('#lastName');
  const emailElement = document.querySelector('#email');
  const phoneElement = document.querySelector('#phone');
  const titleElement = document.querySelector('#title');
  const companySizeElement = document.querySelector('#companySize');
  const industryElement = document.querySelector('#Industry');
  const smsOptInElement = document.querySelector('#sms_opt_in');

  // Load form data from localStorage or set default values
  firstNameElement.value = localStorage.getItem('firstName') || 'John';
  lastNameElement.value = localStorage.getItem('lastName') || 'Doe';
  emailElement.value = localStorage.getItem('email') || 'sbarde@attentive.com';
  phoneElement.value = localStorage.getItem('phone') || '+16465043689';
  titleElement.value = localStorage.getItem('title') || 'Manager';
  companySizeElement.value = localStorage.getItem('companySize') || '51-500';
  industryElement.value = localStorage.getItem('Industry') || 'Technology';
  smsOptInElement.checked = localStorage.getItem('smsOptIn') === 'true';

  // Add event listener to update localStorage on input change
  [firstNameElement, lastNameElement, emailElement, phoneElement, titleElement, companySizeElement, industryElement, smsOptInElement].forEach(element => {
      element.addEventListener('input', updateLocalStorage);
  });

  // Handle form submission
  document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting

    const phone = phoneElement.value;
    const email = emailElement.value;

    // Check if the user is already a subscriber
    checkSubscriberStatus(attentiveAPIKey, phone, email)
        .then(response => {
            const isEligible = response.subscriptionEligibilities[0]?.eligibility.isEligible;
            if (!isEligible) {
                // If user is not a subscriber, subscribe them
                return subscribeUser(attentiveAPIKey, phone, email);
            }
        })
        .then(response => {
            console.log('Subscription status:', response);
            // Handle success or any additional actions here

           // Delay calling the functions for 30 seconds
           setTimeout(() => {
                // Call meetingRequestEvent function
                meetingRequestEvent(attentiveAPIKey, email, phone);

                // Call passCustomAttributes function
                passCustomAttributes(attentiveAPIKey, email, phone);
            }, 30000); // 30 seconds delay

            // Delay calling the functions for 5 minutes 
           setTimeout(() => {
            // Call sendPurchaseEvent function
            sendPurchaseEvent(attentiveAPIKey, email, phone);
        }, 300000); // 5 minute delay
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors here
        });

        // Call the function to send product view event only if on products.html
        if (window.location.pathname.includes('products.html')) {
          sendProductViewEvent(attentiveAPIKey, emailElement.value, phoneElement.value);
      }
  });
});


// Function to check if the user is already a subscriber
function checkSubscriberStatus(attentiveAPIKey, phone, email) {
  const url = `https://api.attentivemobile.com/v1/subscriptions?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`;
  return fetch(url, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${attentiveAPIKey}`
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      const isEligible = data.subscriptionEligibilities[0]?.eligibility.isEligible;
      if (!isEligible) {
          console.log('User is not a subscriber');
      } else {
          console.log('User is already a subscriber');
      }
      return data; // Return the response data
  })
  .catch(error => {
      console.error('Error checking subscriber status:', error);
      throw error; // Propagate the error to the next catch block if needed
  });
}

// Subscribers API: Function to subscribe user if not already a subscriber
function subscribeUser(attentiveAPIKey, phone, email) {
  const url = 'https://api.attentivemobile.com/v1/subscriptions';
  const body = JSON.stringify({
      user: {
          phone: phone,
          email: email
      },
      signUpSourceId: '1005146', // Update this with your source ID
      subscriptionType: 'MARKETING'
  });
  return fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${attentiveAPIKey}`,
          'Content-Type': 'application/json'
      },
      body: body
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      console.log('User subscribed successfully:', data);
      return data; // Return the response data
  })
  .catch(error => {
      console.error('Error subscribing user:', error);
      throw error; // Propagate the error to the next catch block if needed
  });
}

// Product View API: Function to send product view event
function sendProductViewEvent(attentiveAPIKey, email, phone) {
  const url = 'https://api.attentivemobile.com/v1/events/ecommerce/product-view';
  const body = JSON.stringify({
      items: [
          {
              productId: 'AB12345',
              productVariantId: 'CD12345',
              productImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              productUrl: 'https://attentive-sales-engineering.github.io/attentive-b2b-demo/products.html',
              name: 'Quantum Pay Total Solution',
              price: [
                  {
                      value: 5000,
                      currency: 'USD'
                  }
              ],
              quantity: 1
          }
      ],
      user: {
          phone: phone,
          email: email
      }
  });

  fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${attentiveAPIKey}`,
          'Content-Type': 'application/json'
      },
      body: body
  })
  .then(response => response.json())
  .then(data => {
      console.log('Product View Event Response:', data);
      // Handle response here
  })
  .catch(error => {
      console.error('Error sending product view event:', error);
      // Handle error here
  });
}

// Custom Events API: Function to send meeting request event
function meetingRequestEvent(attentiveAPIKey, email, phone) {
  const url = 'https://api.attentivemobile.com/v1/events/custom';
  const body = JSON.stringify({
      type: 'Meeting Request',
      user: {
          phone: phone,
          email: email
      }
  });

  fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${attentiveAPIKey}`,
          'Content-Type': 'application/json'
      },
      body: body
  })
  .then(response => response.json())
  .then(data => {
      console.log('Meeting Request Event Response:', data);
      // Handle response here
  })
  .catch(error => {
      console.error('Error sending meeting request event:', error);
      // Handle error here
  });
}

// Custom Attributes API: Function to pass custom attributes
function passCustomAttributes(attentiveAPIKey, email, phone) {
  const url = 'https://api.attentivemobile.com/v1/attributes/custom';
  const body = JSON.stringify({
      properties: {
          firstName: localStorage.getItem('firstName') || '',
          lastName: localStorage.getItem('lastName') || '',
          title: localStorage.getItem('title') || '',
          companySize: localStorage.getItem('companySize') || '',
          Industry: localStorage.getItem('Industry') || '',
          account_owner: 'Bill Goddard', // Example value for account owner
          opportunity_status: 'Demo Booked' // Example value for opportunity status
      },
      user: {
          phone: phone,
          email: email
      }
  });

  fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${attentiveAPIKey}`,
          'Content-Type': 'application/json'
      },
      body: body
  })
  .then(response => response.json())
  .then(data => {
      console.log('Custom Attributes Response:', data);
      // Handle response here
  })
  .catch(error => {
      console.error('Error passing custom attributes:', error);
      // Handle error here
  });
}

// Purchase API: Function to send purchase event
function sendPurchaseEvent(attentiveAPIKey, email, phone) {
    const url = 'https://api.attentivemobile.com/v1/events/ecommerce/purchase';
    const body = JSON.stringify({
        items: [
            {
                productId: 'AB12345',
                productVariantId: 'CD12345',
                productImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                productUrl: 'https://attentive-sales-engineering.github.io/attentive-b2b-demo/products.html',
                name: 'Quantum Pay Total Solution',
                price: [
                    {
                        value: 5000,
                        currency: 'USD'
                    }
                ],
                quantity: 1
            }
        ],
        user: {
            phone: phone,
            email: email
        }
    });
  
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${attentiveAPIKey}`,
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        console.log('Purchase Event Response:', data);
        // Handle response here
    })
    .catch(error => {
        console.error('Error sending purchase event:', error);
        // Handle error here
    });
  }
  