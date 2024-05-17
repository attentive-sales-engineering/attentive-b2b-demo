const attentiveAPIKey = 'clVwN3JvU1RZUjdMaThxMDMxOUVqd2ZnYlVZbFAzRndnSVdN';

if (window.location.pathname.endsWith('index.html')) {
    console.log("Page: index.html");
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

    // Get input elements
    const firstNameElement = document.querySelector('#firstName');
    const lastNameElement = document.querySelector('#lastName');
    const emailElement = document.querySelector('#email');
    const phoneElement = document.querySelector('#phone');
    const titleElement = document.querySelector('#title');
    const companySizeElement = document.querySelector('#companySize');
    const industryElement = document.querySelector('#Industry');
    const smsOptInElement = document.querySelector('#sms_opt_in');

    // Load default values for form fields if empty
    firstNameElement.value = localStorage.getItem('firstName') || 'John';
    lastNameElement.value = localStorage.getItem('lastName') || 'Smith';
    emailElement.value = localStorage.getItem('email') || 'sbarde@attentive.com';
    phoneElement.value = localStorage.getItem('phone') || '+16465043689';
    titleElement.value = localStorage.getItem('title') || 'Vice President';
    companySizeElement.value = localStorage.getItem('companySize') || '51-500';
    industryElement.value = localStorage.getItem('Industry') || 'Technology';
    smsOptInElement.checked = localStorage.getItem('smsOptIn') === 'true';

    // Event listeners for input fields
    const inputElements = [firstNameElement, lastNameElement, emailElement, phoneElement, titleElement, companySizeElement, industryElement, smsOptInElement];
    inputElements.forEach(element => {
        element.addEventListener('input', updateLocalStorage);
    });

    // Form submission handler
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from submitting

        const phone = phoneElement.value;
        const email = emailElement.value;

        console.log(`firstName: ${firstNameElement.value}, lastName: ${lastNameElement.value}, email: ${email}, phone: ${phone}, title: ${titleElement.value}, companySize: ${companySizeElement.value}, Industry: ${industryElement.value}, smsOptIn: ${smsOptInElement.checked}`);

        // Subscribe the user
        subscribeUser(phone, email);

        // Meeting request custom event and pass custom attributes
        setTimeout(() => {
            meetingRequestEvent(phone, email);
            passCustomAttributes(phone, email);
        }, 10000); // 5 seconds delay

        // send purchase event
        setTimeout(() => {
            sendPurchaseEvent(phone, email);
        }, 120000); // 2 minutes delay 

        const form = document.getElementById('bookingForm');
        const thankYouMessage = document.getElementById('thankYouMessage');

        // Hide the form
        form.style.display = 'none';
        // Show the thank you for submitting message
        thankYouMessage.style.display = 'block';
    });
}

// Call the function to send product view event only if on products.html
if (window.location.pathname.includes('products.html')) {
    console.log("Page: products.html");
    const storedPhone = localStorage.getItem('phone') || '+16465043689';
    const storedEmail = localStorage.getItem('email') || 'sbarde@attentive.com';
    console.log("Phone: ", storedPhone);
    console.log("Email: ", storedEmail);
    if (storedPhone && storedEmail) {
        sendProductViewEvent(storedPhone, storedEmail);
    }
}


// Get Subscribers API: check if the user is already a subscriber
function checkSubscriberStatus(phone, email) {
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/subscriptions';

    //const url = `${apiUrl}?phone=${encodeURIComponent(phone)}`;
    const url = 'https://attentive-api-swagger.herokuapp.com/subscriptions?email=sbarde%40attentive.com';
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(url, requestOptions)
        .then(response => {
            console.log('GET Subscriber API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log('API Response:', result))
        .catch(error => console.error('API request failed', error));
}

// Subscribers API: subscribe user if not already a subscriber
function subscribeUser(phone, email) {
    console.log("Adding subscriber");
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/subscriptions';

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);

    var body = JSON.stringify({
        "user": {
            "phone": phone,
            "email": email
        },
        "signUpSourceId": "1005146"
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow'
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            console.log('POST Subscriber API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log('API Response:', result))
        .catch(error => console.error('API request failed', error));
}

// Custom Events API: send meeting request event
function meetingRequestEvent(phone, email) {
    console.log("Custom Event: Meeting Request");
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/events/custom';
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);
    
    const body = JSON.stringify({
        type: 'Meeting Request',
        user: {
            phone: phone,
            email: email
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow'
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            console.log('Custom Event API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log('Meeting request event successfully logged'))
        .catch(error => console.error('API request failed', error));
}

// Custom Attributes API: pass custom attributes
function passCustomAttributes(phone, email) {
    console.log("Adding custom attributes");
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/attributes/custom';

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);

    var body = JSON.stringify({
        "properties": {
            "firstName": localStorage.getItem('firstName'),
            "lastName": localStorage.getItem('lastName'),
            "title": localStorage.getItem('title'),
            "companySize": localStorage.getItem('companySize'),
            "Industry": localStorage.getItem('Industry'),
            "account_owner": 'Brian Long', 
            "opportunity_status": 'Demo Booked'

        },
        "user": {
            "phone": phone,
            "email": email
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow'
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            console.log('Custom Attribute API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log('Custom attributes added successfully')) 
        .catch(error => console.error('API request failed', error));
}

// Product View Event API: send product view event
function sendProductViewEvent(phone, email) {
    console.log("Logging product view event");
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/events/ecommerce/product-view';
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);

    const body = JSON.stringify({
        items: [
            {
                productId: 'AB12345',
                productVariantId: 'CD12345',
                productImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                productUrl: 'https://attentive-sales-engineering.github.io/attentive-b2b-demo/products.html',
                name: 'Quantum Pay Edge',
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
  
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow'
    };
    fetch(apiUrl, requestOptions)
        .then(response => {
            console.log('Product View Event API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log("Product view event recorded successfully"))
        .catch(error => console.log('error', error));
}

// Purchase Event API: send purchase event
function sendPurchaseEvent(phone, email) {
    console.log("Logging purchase event");
    const apiUrl = 'https://attentive-api-swagger.herokuapp.com/events/ecommerce/purchase';
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${attentiveAPIKey}`);

    const body = JSON.stringify({
        items: [
            {
                productId: 'AB12345',
                productVariantId: 'CD12345',
                productImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                productUrl: 'https://attentive-sales-engineering.github.io/attentive-b2b-demo/products.html',
                name: 'Quantum Pay Edge',
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
  
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: body,
        redirect: 'follow'
    };
    fetch(apiUrl, requestOptions)
        .then(response => {
            console.log('Purchase Event API Status Code:', response.status);
            return response.text();
        })
        .then(result => console.log("Purchase event recorded successfully"))
        .catch(error => console.log('error', error));
}