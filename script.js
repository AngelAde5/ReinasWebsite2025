document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    // Initialize variables
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const currencyDropdownButton = document.getElementById('currencyDropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const addToBagButtons = document.querySelectorAll('.add-to-bag');
    const bagItemsContainer = document.getElementById('bag-items');
    const totalAmount = document.getElementById('total-amount');
    const currencySymbol = document.getElementById('currency-symbol');
    const userDetailsForm = document.getElementById('user-details-form');
    const orderSuccessMessage = document.getElementById('order-success-message');
    const contactForm = document.getElementById('contactForm');
    const contactSuccessMessage = document.getElementById('contact-success-message');

    const conversionRates = {
        USD: 1.3,
        GBP: 1.0,
        CAD: 1.7,
        EUR: 1.1,
        AED: 4.8,
        ZAR: 20.0,
        NGN: 500.0
    };

    let selectedCurrency = "GBP";

    // Hamburger Menu Functionality
    if (hamburgerMenu && navLinks) {
        console.log('Hamburger menu and nav links found');
        hamburgerMenu.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    } else {
        console.error('Hamburger menu or nav links not found');
    }

    // Currency Dropdown Functionality
    if (currencyDropdownButton) {
        const defaultCurrency = "GBP";
        const defaultFlag = "https://flagcdn.com/gb.svg";
        currencyDropdownButton.innerHTML = `<img src="${defaultFlag}" alt="UK Flag" class="flag-icon"> ${defaultCurrency}`;

        if (dropdownItems.length > 0) {
            dropdownItems.forEach(item => {
                item.addEventListener('click', function (e) {
                    e.preventDefault();
                    selectedCurrency = item.getAttribute('data-currency');
                    const flagSrc = item.querySelector('.flag-icon').src;
                    currencyDropdownButton.innerHTML = `<img src="${flagSrc}" alt="Flag" class="flag-icon"> ${selectedCurrency}`;

                    convertPrices(selectedCurrency);
                    displayBagItems();
                    localStorage.setItem('selectedCurrency', selectedCurrency);
                    localStorage.setItem('selectedFlag', flagSrc);
                });
            });
        } else {
            console.error('Dropdown items not found');
        }
    } else {
        console.error('Currency dropdown button not found');
    }

    // Convert prices to selected currency
    function convertPrices(currency) {
        const rate = conversionRates[currency];

        const lengthSelects = document.querySelectorAll('select');
        if (lengthSelects.length > 0) {
            lengthSelects.forEach(select => {
                const options = Array.from(select.options);
                const selectedValue = select.value;

                select.innerHTML = '';

                options.forEach(option => {
                    const originalPrice = parseFloat(option.getAttribute('data-price'));
                    const convertedPrice = (originalPrice * rate).toFixed(2);
                    const newOption = document.createElement('option');
                    newOption.value = option.value;
                    newOption.setAttribute('data-price', option.getAttribute('data-price'));
                    newOption.textContent = `${option.textContent.split(' - ')[0]} - ${currency} ${convertedPrice}`;
                    select.appendChild(newOption);
                });

                select.value = selectedValue;
            });
        } else {
            console.log('No select elements found for price conversion');
        }

        const priceElements = document.querySelectorAll('.price');
        if (priceElements.length > 0) {
            priceElements.forEach(priceElement => {
                const originalPrice = parseFloat(priceElement.getAttribute('data-original-price'));
                const convertedPrice = (originalPrice * rate).toFixed(2);
                priceElement.textContent = `${currency} ${convertedPrice}`;
            });
        } else {
            console.log('No price elements found for conversion');
        }
    }

    
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedFlag = localStorage.getItem('selectedFlag');
    if (savedCurrency && savedFlag && currencyDropdownButton) {
        console.log('Saved currency found:', savedCurrency);
        selectedCurrency = savedCurrency;
        currencyDropdownButton.innerHTML = `<img src="${savedFlag}" alt="Flag" class="flag-icon"> ${savedCurrency}`;
        convertPrices(selectedCurrency);
    } else {
        console.log('No saved currency found or currency dropdown button missing');
    }

    // Search Functionality
    if (searchInput && searchButton) {
        console.log('Search elements found');
        const productPages = {
            'wigs.html': ['wigs', 'straight', 'wavy', 'curly'],
            'bundles.html': ['bundles', 'straight', 'wavy', 'curly'],
            'hair-products.html': ['products', 'shampoo', 'conditioner', 'hair serum', 'hair spray', 'hair wax'],
            'styling-tools.html': ['styling', 'tools', 'straightener', 'hot-comb', 'curler', 'hair wand curler']
        };

        searchButton.addEventListener('click', function () {
            const searchTerm = searchInput.value.trim().toLowerCase();
            let found = false;

            for (const [page, terms] of Object.entries(productPages)) {
                if (terms.some(term => searchTerm.includes(term))) {
                    window.location.href = page;
                    found = true;
                    break;
                }
            }

            if (!found) {
                alert('Product not found.');
            }
        });
    } else {
        console.log('Search elements not found on this page.');
    }

    // Add to Bag Functionality
    if (addToBagButtons.length > 0) {
        console.log('Add to bag buttons found');
        addToBagButtons.forEach(button => {
            button.addEventListener('click', function () {
                const productCard = button.closest('.product-card, .wig-card, .bundle-card');
                const productName = productCard.querySelector('h3').textContent;
                const priceElement = productCard.querySelector('.price');
                const quantityInput = productCard.querySelector('input[type="number"]');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                let price;
                if (priceElement) {
                    price = parseFloat(priceElement.getAttribute('data-original-price'));
                } else {
                    const lengthSelect = productCard.querySelector('select');
                    const selectedOption = lengthSelect.options[lengthSelect.selectedIndex];
                    price = parseFloat(selectedOption.getAttribute('data-price'));
                }

                const item = {
                    name: productName,
                    price: price * quantity,
                    quantity: quantity
                };

                addToBag(item);
            });
        });
    } else {
        console.log('No add to bag buttons found');
    }

    function addToBag(item) {
        let bagItems = JSON.parse(localStorage.getItem('bagItems')) || [];
        bagItems.push(item);
        localStorage.setItem('bagItems', JSON.stringify(bagItems));
        alert(`${item.name} (Quantity: ${item.quantity}) added to bag!`);
        displayBagItems();
    }

    // Display bag items
    function displayBagItems() {
        const bagItems = JSON.parse(localStorage.getItem('bagItems')) || [];
        if (bagItemsContainer && totalAmount && currencySymbol) {
            console.log('Bag elements found');
            bagItemsContainer.innerHTML = '';
            let total = 0;

            const rate = conversionRates[selectedCurrency];

            bagItems.forEach((item, index) => {
                const convertedPrice = (item.price * rate).toFixed(2);
                const itemElement = document.createElement('div');
                itemElement.className = 'bag-item';
                itemElement.innerHTML = `
                    <p>${item.name} - Quantity: ${item.quantity} - ${selectedCurrency} ${convertedPrice}</p>
                    <button class="remove-item" data-index="${index}">Remove</button>
                `;
                bagItemsContainer.appendChild(itemElement);
                total += item.price * rate;
            });

            totalAmount.textContent = total.toFixed(2);
            currencySymbol.textContent = selectedCurrency;
        } else {
            console.error('Bag elements not found');
        }
    }

    // Remove item from bag
    if (bagItemsContainer) {
        bagItemsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-item')) {
                const index = e.target.getAttribute('data-index');
                let bagItems = JSON.parse(localStorage.getItem('bagItems')) || [];
                bagItems.splice(index, 1);
                localStorage.setItem('bagItems', JSON.stringify(bagItems));
                displayBagItems();
            }
        });
    } else {
        console.error('Bag items container not found');
    }

    // Place order
    if (userDetailsForm) {
        console.log('User details form found');
        userDetailsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission triggered');

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const email = document.getElementById('email').value;

            console.log('Form values:', { name, phone, address, email });

            const bagItems = JSON.parse(localStorage.getItem('bagItems')) || [];

            if (bagItems.length === 0) {
                alert('Your bag is empty. Add items before placing an order.');
                return;
            }

            const order = {
                name: name,
                phone: phone,
                address: address,
                email: email,
                items: bagItems,
                total: totalAmount.textContent
            };

            console.log('Order Placed:', order);

            if (orderSuccessMessage) {
                console.log('Order success message found');
                orderSuccessMessage.style.display = 'block'; // Show the success message
            } else {
                console.error('Order success message element not found');
            }

            localStorage.removeItem('bagItems');
            displayBagItems();
            userDetailsForm.reset();
        });
    } else {
        console.error('User details form not found');
    }

    // Close success message for Place Order
    const closeOrderSuccessMessage = document.getElementById('close-order-success-message');
    if (closeOrderSuccessMessage) {
        console.log('Close button for order success message found'); 
        closeOrderSuccessMessage.addEventListener('click', function () {
            console.log('Close button clicked'); // 
            if (orderSuccessMessage) {
                console.log('Order success message element found:', orderSuccessMessage); 
                orderSuccessMessage.style.display = 'none'; 
                console.log('Order success message hidden'); 
            } else {
                console.error('Order success message element not found'); 
            }
        });
    } else {
        console.error('Close button for order success message not found');
    }

    // Contact Us Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            console.log('Contact Form Submitted:', { name, email, message });

            if (contactSuccessMessage) {
                console.log('Contact success message found');
                contactSuccessMessage.style.display = 'block'; // Show the message
            } else {
                console.error('Contact success message element not found');
            }

            contactForm.reset();
        });
    } else {
        console.error('Contact form not found');
    }

    // Close success message for Contact Us
    const closeContactSuccessMessage = document.getElementById('close-contact-success-message');
    if (closeContactSuccessMessage) {
        console.log('Close button for contact success message found'); 
        closeContactSuccessMessage.addEventListener('click', function () {
            console.log('Close button clicked'); 
            if (contactSuccessMessage) {
                console.log('Contact success message element found:', contactSuccessMessage); 
                contactSuccessMessage.style.display = 'none'; 
                console.log('Contact success message hidden'); 
            } else {
                console.error('Contact success message element not found'); 
            }
        });
    } else {
        console.error('Close button for contact success message not found');
    }

    // Initial display of bag items
    displayBagItems();
});