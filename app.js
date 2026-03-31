 // Global State
        let products = [];
        let cart = [];
        let currentCategory = 'All';
        let currentOccasion = 'All';
        let currentGender = 'All';

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadSampleProducts();
            setupEventListeners();
            setupScrollAnimations();
            updateCart();
        });

        // Navigation
    function showPage(pageId) {
    const allSections = document.querySelectorAll('.page-section');
    const targetSection = document.getElementById(pageId);

    // Fade out current section
    allSections.forEach(section => {
        if (section.classList.contains('active')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                section.classList.remove('active');
                section.style.opacity = '';
                section.style.transform = '';
            }, 300);
        }
    });

    

            
            // Fade in target section
            setTimeout(() => {
                targetSection.classList.add('active');
                targetSection.style.opacity = '0';
                targetSection.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    targetSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                    
                    // Reset transition after animation
                    setTimeout(() => {
                        targetSection.style.transition = '';
                    }, 500);
                }, 50);
                 if (pageId === "checkout") {
            renderCheckout();
        }
                if (pageId === 'marketplace') {
                    renderProducts();
                }
            }, 300);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Scroll Animations
        function setupScrollAnimations() {
            // Main reveal observer with different thresholds
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, { 
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe all reveal elements
            document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .blur-in, .rate-card').forEach(el => {
                revealObserver.observe(el);
            });

            // Parallax effect on scroll
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        handleParallax();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            function handleParallax() {
                const scrolled = window.pageYOffset;
                
                // Parallax for hero section
                const hero = document.querySelector('.hero');
                if (hero) {
                    const heroContent = hero.querySelector('.hero-content');
                    if (heroContent && scrolled < window.innerHeight) {
                        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
                    }
                }

                // Parallax for rate cards
                document.querySelectorAll('.rate-card').forEach((card, index) => {
                    const rect = card.getBoundingClientRect();
                    const cardTop = rect.top;
                    const windowHeight = window.innerHeight;
                    
                    if (cardTop < windowHeight && cardTop > -rect.height) {
                        const speed = 0.05 + (index * 0.01);
                        const yPos = -(scrolled * speed);
                        card.style.transform = `translateY(${yPos}px)`;
                    }
                });

                // Subtle parallax for care cards
                document.querySelectorAll('.care-card').forEach((card, index) => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.top > -rect.height) {
                        const speed = index % 2 === 0 ? 0.03 : -0.03;
                        const xPos = scrolled * speed;
                        card.style.transform = `translateX(${xPos}px)`;
                    }
                });
            }

            // Navbar scroll effect with smooth transitions
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const navbar = document.getElementById('navbar');
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                // Hide navbar on scroll down, show on scroll up
                if (currentScroll > lastScroll && currentScroll > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
            });

            // Add floating animation to trust badges
            document.querySelectorAll('.trust-badge').forEach((badge, index) => {
                badge.style.animationDelay = `${index * 0.2}s`;
                badge.classList.add('float-animation');
            });

            // Scroll progress indicator
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--gold), var(--gold-light));
                z-index: 10000;
                transition: width 0.2s ease;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            `;
            document.body.appendChild(progressBar);

            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + '%';
            });

            // Add stagger effect to product cards on render
            const productObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 50);
                    }
                });
            }, { threshold: 0.1 });

            // This will be called when products are rendered
            window.observeProducts = () => {
                document.querySelectorAll('.product-card:not(.visible)').forEach(card => {
                    productObserver.observe(card);
                });
            };

            // Animate numbers on scroll for rate cards
            const animateValue = (element, start, end, duration) => {
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const value = Math.floor(progress * (end - start) + start);
                    element.textContent = element.textContent.replace(/[\d,]+/, value.toLocaleString());
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
            };

            const rateObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                        entry.target.classList.add('animated');
                        const priceElements = entry.target.querySelectorAll('.rate-price');
                        priceElements.forEach(priceEl => {
                            const priceText = priceEl.textContent;
                            const priceMatch = priceText.match(/([\d,]+)/);
                            if (priceMatch) {
                                const targetValue = parseInt(priceMatch[1].replace(/,/g, ''));
                                setTimeout(() => {
                                    animateValue(priceEl, 0, targetValue, 1000);
                                }, 100);
                            }
                        });
                    }
                });
            }, { threshold: 0.3 });

            document.querySelectorAll('.rate-card').forEach(card => {
                rateObserver.observe(card);
            });
        }

        // Event Listeners
        function setupEventListeners() {
            // Seller Form
            document.getElementById('sellerForm').addEventListener('submit', handleSellerSubmit);

            // Category Buttons
            document.querySelectorAll('.category-btn:not(.gender-btn)').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.category-btn:not(.gender-btn)').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    renderProducts();
                });
            });

            // Gender Buttons
            document.querySelectorAll('.gender-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentGender = this.dataset.gender;
                    renderProducts();
                });
            });

            // Occasion Buttons
            document.querySelectorAll('.occasion-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentOccasion = this.dataset.occasion;
                    renderProducts();
                });
            });

            // Filters
            document.querySelectorAll('.metal-filter, .carat-filter, .color-filter, .gender-filter').forEach(filter => {
                filter.addEventListener('change', renderProducts);
            });

            // Price Range
            document.getElementById('minPrice').addEventListener('input', renderProducts);
            document.getElementById('maxPrice').addEventListener('input', renderProducts);

            // Search
            document.getElementById('searchInput').addEventListener('input', renderProducts);
        }

        // Load Sample Products
        function loadSampleProducts() {
            products = [
                {
                    name: 'Royal Diamond Necklace',
                    metal: 'Diamond',
                    carat: '18K',
                    price: 450000,
                    originalPrice: 550000,
                    discount: 18,
                    color: 'White',
                    gender: 'Female',
                    occasions: ['Wedding', 'Anniversary', 'Formal'],
                    description: 'Exquisite diamond necklace with VVS1 clarity stones set in 18K white gold',
                    image: 'royal.jpg',
                    size: ['16 inches', '18 inches', '20 inches'],
                    measurements: { length: '18 inches', weight: '45g', diamondWeight: '5 carats' },
                    rating: 4.8,
                    reviewCount: 127,
                    reviews: [
                        { name: 'Priya Sharma', rating: 5, date: '2024-03-15', text: 'Absolutely stunning piece! The diamonds are brilliant and the craftsmanship is impeccable.' },
                        { name: 'Anjali Mehta', rating: 5, date: '2024-03-10', text: 'Perfect for my wedding. Exceeded all expectations. Highly recommended!' },
                        { name: 'Kavita Singh', rating: 4, date: '2024-03-05', text: 'Beautiful necklace, though slightly heavy for daily wear. Perfect for special occasions.' }
                    ]
                },
                {
                    name: 'Classic Gold Chain',
                    metal: 'Gold',
                    carat: '22K',
                    price: 125000,
                    originalPrice: 135000,
                    discount: 7,
                    color: 'Yellow',
                    gender: 'Unisex',
                    occasions: ['Festival', 'Casual', 'Wedding'],
                    description: 'Traditional 22K gold chain, perfect for everyday elegance',
                    image: 'goldc.jpg',
                    size: ['18 inches', '20 inches', '22 inches', '24 inches'],
                    measurements: { length: '20 inches', weight: '35g', width: '3mm' },
                    rating: 4.9,
                    reviewCount: 234,
                    reviews: [
                        { name: 'Rajesh Kumar', rating: 5, date: '2024-03-20', text: 'Excellent quality gold. BIS hallmarked and perfect weight.' },
                        { name: 'Deepa Nair', rating: 5, date: '2024-03-18', text: 'Beautiful traditional design. My husband loves it!' }
                    ]
                },
                {
                    name: 'Platinum Engagement Ring',
                    metal: 'Platinum',
                    carat: '950',
                    price: 185000,
                    originalPrice: 220000,
                    discount: 16,
                    color: 'White',
                    gender: 'Female',
                    occasions: ['Engagement', 'Wedding'],
                    description: 'Stunning solitaire diamond ring in pure platinum',
                    image: 'pr.jpeg',
                    size: ['Size 10', 'Size 12', 'Size 14', 'Size 16', 'Size 18'],
                    measurements: { ringSize: 'US 6 / Indian 12', weight: '8g', diamondWeight: '1 carat' },
                    rating: 5.0,
                    reviewCount: 89,
                    reviews: [
                        { name: 'Neha Kapoor', rating: 5, date: '2024-03-22', text: 'Dream ring! The platinum quality is exceptional and the diamond is perfect.' },
                        { name: 'Simran Patel', rating: 5, date: '2024-03-16', text: 'My fiancé proposed with this ring. It\'s absolutely gorgeous!' }
                    ]
                },
                {
                    name: 'Rose Gold Bracelet',
                    metal: 'Rose Gold',
                    carat: '18K',
                    price: 85000,
                    originalPrice: 95000,
                    discount: 11,
                    color: 'Rose',
                    gender: 'Female',
                    occasions: ['Anniversary', 'Birthday', 'Casual'],
                    description: 'Delicate rose gold bracelet with intricate filigree work',
                    image: 'brac.jpg',
                    size: ['6.5 inches', '7 inches', '7.5 inches'],
                    measurements: { length: '7 inches', weight: '15g', width: '8mm' },
                    rating: 4.7,
                    reviewCount: 156,
                    reviews: [
                        { name: 'Meera Reddy', rating: 5, date: '2024-03-19', text: 'Delicate and beautiful. The rose gold color is perfect!' },
                        { name: 'Ritu Joshi', rating: 4, date: '2024-03-12', text: 'Lovely bracelet, though I wish it came in a larger size.' }
                    ]
                },
                {
                    name: 'Sterling Silver Earrings',
                    metal: 'Silver',
                    carat: '925',
                    price: 12500,
                    originalPrice: 15000,
                    discount: 17,
                    color: 'Silver',
                    gender: 'Female',
                    occasions: ['Casual', 'Formal', 'Festival'],
                    description: 'Elegant drop earrings in 925 sterling silver',
                     image: 'silver.jpg',
                    size: ['One Size'],
                    measurements: { length: '1.5 inches', weight: '6g', width: '0.5 inches' },
                    rating: 4.6,
                    reviewCount: 203,
                    reviews: [
                        { name: 'Sneha Gupta', rating: 5, date: '2024-03-21', text: 'Great value for money! They look much more expensive than they are.' },
                        { name: 'Pooja Iyer', rating: 4, date: '2024-03-14', text: 'Pretty earrings, perfect for daily wear.' }
                    ]
                },
                {
                    name: 'Vintage Gold Bangles',
                    metal: 'Gold',
                    carat: '22K',
                    price: 165000,
                    originalPrice: 180000,
                    discount: 8,
                    color: 'Yellow',
                    gender: 'Female',
                    occasions: ['Wedding', 'Festival'],
                    description: 'Traditional temple design bangles in 22K gold',
                    image: 'bang.jpg',
                    size: ['2-4', '2-6', '2-8'],
                    measurements: { diameter: '2.6 inches', weight: '50g per pair', width: '12mm' },
                    rating: 4.9,
                    reviewCount: 178,
                    reviews: [
                        { name: 'Lakshmi Rao', rating: 5, date: '2024-03-17', text: 'Exquisite temple work! These are heirloom quality.' },
                        { name: 'Divya Krishnan', rating: 5, date: '2024-03-09', text: 'Perfect for my wedding. The craftsmanship is outstanding!' }
                    ]
                },
                {
                    name: 'Men\'s Gold Ring',
                    metal: 'Gold',
                    carat: '18K',
                    price: 95000,
                    originalPrice: 105000,
                    discount: 10,
                    color: 'Yellow',
                    gender: 'Male',
                    occasions: ['Wedding', 'Formal', 'Casual'],
                    description: 'Bold 18K gold signet ring with contemporary design',
                     image: 'menr.jpg',
                    size: ['Size 18', 'Size 20', 'Size 22', 'Size 24'],
                    measurements: { ringSize: 'US 10 / Indian 20', weight: '18g', width: '10mm' },
                    rating: 4.8,
                    reviewCount: 92,
                    reviews: [
                        { name: 'Arjun Malhotra', rating: 5, date: '2024-03-20', text: 'Perfectly masculine design. Love the weight and finish.' },
                        { name: 'Vikram Shah', rating: 5, date: '2024-03-15', text: 'Excellent quality. Great for daily wear.' }
                    ]
                },
                {
                    name: 'Platinum Band Ring',
                    metal: 'Platinum',
                    carat: '950',
                    price: 145000,
                    originalPrice: 160000,
                    discount: 9,
                    color: 'White',
                    gender: 'Male',
                    occasions: ['Wedding', 'Engagement'],
                    description: 'Sleek platinum band with brushed finish for modern gentlemen',
                    image: 'pringm.jpg',
                    size: ['Size 20', 'Size 22', 'Size 24', 'Size 26'],
                    measurements: { ringSize: 'US 11 / Indian 22', weight: '12g', width: '6mm' },
                    rating: 5.0,
                    reviewCount: 67,
                    reviews: [
                        { name: 'Karan Sethi', rating: 5, date: '2024-03-18', text: 'Simple, elegant, and durable. Perfect wedding band.' },
                        { name: 'Rohit Desai', rating: 5, date: '2024-03-11', text: 'The platinum quality is exceptional. Worth every rupee!' }
                    ]
                },
                {
                    name: 'Men\'s Silver Bracelet',
                    metal: 'Silver',
                    carat: '925',
                    price: 18500,
                    originalPrice: 22000,
                    discount: 16,
                    color: 'Silver',
                    gender: 'Male',
                    occasions: ['Casual', 'Formal'],
                    description: 'Contemporary sterling silver link bracelet with oxidized detailing',
                    image: 'bram.jpg',
                    size: ['7.5 inches', '8 inches', '8.5 inches'],
                    measurements: { length: '8 inches', weight: '35g', width: '10mm' },
                    rating: 4.7,
                    reviewCount: 145,
                    reviews: [
                        { name: 'Aditya Verma', rating: 5, date: '2024-03-16', text: 'Stylish and well-made. Gets lots of compliments!' },
                        { name: 'Nikhil Pandey', rating: 4, date: '2024-03-08', text: 'Good quality silver. Slightly heavier than expected but looks great.' }
                    ]
                },
                {
                    name: 'Diamond Stud Earrings',
                    metal: 'Diamond',
                    carat: '18K',
                    price: 285000,
                    originalPrice: 320000,
                    discount: 11,
                    color: 'White',
                    gender: 'Unisex',
                    occasions: ['Formal', 'Casual', 'Wedding'],
                    description: 'Classic diamond studs in 18K white gold, perfect for any occasion',
                     image: 'stud.jpg',
                    size: ['0.5 carat', '0.75 carat', '1 carat'],
                    measurements: { diamondWeight: '0.75 carat total', clarity: 'VS1', color: 'F' },
                    rating: 4.9,
                    reviewCount: 198,
                    reviews: [
                        { name: 'Shruti Bose', rating: 5, date: '2024-03-19', text: 'Timeless elegance! The diamonds are brilliant and sparkle beautifully.' },
                        { name: 'Rahul Khanna', rating: 5, date: '2024-03-13', text: 'Bought these for my wife. She absolutely loves them!' }
                    ]
                }
            ];
        }

        // Handle Seller Form Submit
        function handleSellerSubmit(e) {
            e.preventDefault();
            
            const occasions = Array.from(document.getElementById('occasion').selectedOptions).map(opt => opt.value);
            
            const newProduct = {
                name: document.getElementById('productName').value,
                metal: document.getElementById('metalType').value,
                carat: document.getElementById('carat').value,
                price: parseFloat(document.getElementById('price').value),
                color: document.getElementById('color').value,
                gender: document.getElementById('gender').value,
                occasions: occasions,
                description: document.getElementById('description').value,
                image: document.getElementById('imageUrl').value
            };

            products.push(newProduct);
            
            // Reset form
            document.getElementById('sellerForm').reset();
            
            // Show success message
            alert('Product listed successfully! You can view it in the Marketplace.');
            
            // Navigate to marketplace
            showPage('marketplace');
        }

        // Render Products
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            // Get active filters
            const metalFilters = Array.from(document.querySelectorAll('.metal-filter:checked')).map(f => f.value);
            const caratFilters = Array.from(document.querySelectorAll('.carat-filter:checked')).map(f => f.value);
            const colorFilters = Array.from(document.querySelectorAll('.color-filter:checked')).map(f => f.value);
            const genderFilters = Array.from(document.querySelectorAll('.gender-filter:checked')).map(f => f.value);
            const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
            const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

            // Filter products
            const filteredProducts = products.filter(product => {
                const matchesCategory = currentCategory === 'All' || product.metal === currentCategory;
                const matchesOccasion = currentOccasion === 'All' || product.occasions.includes(currentOccasion);
                const matchesGender = currentGender === 'All' || product.gender === currentGender;
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                    product.description.toLowerCase().includes(searchTerm);
                const matchesMetal = metalFilters.length === 0 || metalFilters.includes(product.metal);
                const matchesCarat = caratFilters.length === 0 || caratFilters.includes(product.carat);
                const matchesColor = colorFilters.length === 0 || colorFilters.includes(product.color);
                const matchesGenderFilter = genderFilters.length === 0 || genderFilters.includes(product.gender);
                const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

                return matchesCategory && matchesOccasion && matchesGender && matchesSearch && 
                       matchesMetal && matchesCarat && matchesColor && matchesGenderFilter && matchesPrice;
            });

            // Render
            if (filteredProducts.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <h3>No Products Found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filteredProducts.map((product, index) => {
                const genderIcon = product.gender === 'Male' ? '👔' : product.gender === 'Female' ? '👗' : '⚡';
                const productIndex = products.indexOf(product);
                return `
                <div class="product-card reveal-scale stagger-${Math.min(index % 6 + 1, 6)}" style="animation-delay: ${index * 0.1}s;" onclick="viewProductDetail(${productIndex})">
                    <div class="product-image">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '💎'}
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.metal} • ${product.carat} • ${genderIcon} ${product.gender}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-rating">
                            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                            <span class="rating-count">(${product.reviewCount} reviews)</span>
                        </div>
                        <div class="product-details">
                            <span>${product.color}</span>
                            <span>•</span>
                            <span>${product.occasions[0]}</span>
                        </div>
                        ${product.discount ? `
                            <div style="margin-bottom: 0.5rem;">
                                <span class="original-price" style="font-size: 0.9rem;">₹${product.originalPrice.toLocaleString()}</span>
                                <span class="discount-badge" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${product.discount}% OFF</span>
                            </div>
                        ` : ''}
                        <div class="product-price">₹${product.price.toLocaleString()}</div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-actions">
                            <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${productIndex})">Add to Cart</button>
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); buyNow(${productIndex})">Buy Now</button>
                        </div>
                    </div>
                </div>
            `}).join('');

            // Trigger animations with observer
            setTimeout(() => {
                if (window.observeProducts) {
                    window.observeProducts();
                }
            }, 100);
        }

        // Cart Functions
        function addToCart(index) {
            const product = products[index];
            cart.push(product);
            updateCart();
            
            // Show brief notification
            const notification = document.createElement('div');
            notification.textContent = 'Added to cart!';
            notification.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--gold);
                color: var(--bg-dark);
                padding: 1rem 2rem;
                border-radius: 10px;
                font-weight: 600;
                z-index: 3000;
                animation: fadeInUp 0.3s ease;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        }

        function buyNow(index) {
            addToCart(index);
            toggleCart();
        }

        function updateCart() {
            const cartCount = document.getElementById('cartCount');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');

            cartCount.textContent = cart.length;

            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-state">
                        <p>Your cart is empty</p>
                    </div>
                `;
                cartTotal.textContent = '₹0';
                return;
            }

            const total = cart.reduce((sum, item) => sum + item.price, 0);

            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-image">💎</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
                </div>
            `).join('');

            cartTotal.textContent = `₹${total.toLocaleString()}`;
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            updateCart();
        }

        function toggleCart() {
            const cartModal = document.getElementById('cartModal');
            cartModal.classList.toggle('active');
        }

        function checkout() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            showPage('checkout');
            
        }

        // View Product Detail
        function viewProductDetail(productIndex) {
            const product = products[productIndex];
            const relatedProducts = products.filter(p => 
                p.metal === product.metal && p !== product
            ).slice(0, 3);

            const detailHTML = `
                <div class="product-detail-grid reveal-scale active">
                    <div class="product-detail-image shine-effect">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">` : '💎'}
                    </div>
                    
                    <div class="product-detail-info">
                        <div class="product-detail-header">
                            <h1>${product.name}</h1>
                            <div class="product-rating">
                                <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                                <span class="rating-count">${product.rating} (${product.reviewCount} reviews)</span>
                            </div>
                        </div>

                        <div class="product-price-section">
                            <div class="current-price">₹${product.price.toLocaleString()}</div>
                            ${product.discount ? `
                                <div>
                                    <span class="original-price">₹${product.originalPrice.toLocaleString()}</span>
                                    <span class="discount-badge">${product.discount}% OFF</span>
                                </div>
                                <p style="color: #66ff66; margin-top: 1rem; font-size: 0.9rem;">You save ₹${(product.originalPrice - product.price).toLocaleString()}</p>
                            ` : ''}
                        </div>

                        <div class="product-specifications">
                            <h3 style="color: var(--gold); margin-bottom: 1.5rem;">Specifications</h3>
                            <div class="spec-row">
                                <span class="spec-label">Metal Type</span>
                                <span class="spec-value">${product.metal}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Purity/Carat</span>
                                <span class="spec-value">${product.carat}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Color</span>
                                <span class="spec-value">${product.color}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Gender</span>
                                <span class="spec-value">${product.gender}</span>
                            </div>
                            ${product.measurements.weight ? `
                                <div class="spec-row">
                                    <span class="spec-label">Weight</span>
                                    <span class="spec-value">${product.measurements.weight}</span>
                                </div>
                            ` : ''}
                            ${product.measurements.length ? `
                                <div class="spec-row">
                                    <span class="spec-label">Length</span>
                                    <span class="spec-value">${product.measurements.length}</span>
                                </div>
                            ` : ''}
                            ${product.measurements.diamondWeight ? `
                                <div class="spec-row">
                                    <span class="spec-label">Diamond Weight</span>
                                    <span class="spec-value">${product.measurements.diamondWeight}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${product.size && product.size.length > 0 ? `
                            <div class="size-selector">
                                <h4 style="color: var(--gold); margin-bottom: 1rem;">Select Size</h4>
                                <div class="size-options">
                                    ${product.size.map((size, idx) => `
                                        <div class="size-option ${idx === 0 ? 'selected' : ''}" onclick="selectSize(this)">
                                            ${size}
                                        </div>
                                    `).join('')}
                                </div>
                                <p style="color: var(--grey-light); margin-top: 1rem; font-size: 0.9rem;">
                                    Not sure about your size? <a href="#" onclick="showPage('sizeChart')" style="color: var(--gold);">Check our Size Guide</a>
                                </p>
                            </div>
                        ` : ''}

                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="addToCart(${productIndex})">Add to Cart</button>
                            <button class="btn btn-secondary" onclick="buyNowFromDetail(${productIndex})">Buy Now</button>
                        </div>

                        <div class="delivery-info">
                            <h4>✓ Free Delivery</h4>
                            <p style="color: var(--grey-light);">
                                • Estimated delivery: 5-7 business days<br>
                                • Free insured shipping with signature required<br>
                                • 30-day easy returns and exchanges<br>
                                • Lifetime warranty on craftsmanship<br>
                                • Comes with authenticity certificate
                            </p>
                        </div>

                        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(212, 175, 55, 0.05); border-radius: 10px;">
                            <h4 style="color: var(--gold); margin-bottom: 0.5rem;">Product Description</h4>
                            <p style="color: var(--grey-light); line-height: 1.8;">${product.description}</p>
                        </div>
                    </div>
                </div>

                ${product.reviews && product.reviews.length > 0 ? `
                    <div class="reviews-section reveal">
                        <h2 style="color: var(--gold); font-size: 2.5rem; margin-bottom: 2rem;">Customer Reviews</h2>
                        ${product.reviews.map(review => `
                            <div class="review-card">
                                <div class="review-header">
                                    <div>
                                        <div class="reviewer-name">${review.name}</div>
                                        <div class="stars" style="color: var(--gold); font-size: 1rem;">
                                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <div class="review-date">${review.date}</div>
                                </div>
                                <p class="review-text">${review.text}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${relatedProducts.length > 0 ? `
                    <div class="related-products reveal">
                        <h2 style="color: var(--gold); font-size: 2.5rem; margin-bottom: 2rem;">You May Also Like</h2>
                        <div class="related-grid">
                            ${relatedProducts.map(p => {
                                const pIndex = products.indexOf(p);
                                return `
                                    <div class="product-card" onclick="viewProductDetail(${pIndex})" style="cursor: pointer;">
                                        <div class="product-image">💎</div>
                                        <div class="product-info">
                                            <div class="product-category">${p.metal} • ${p.carat}</div>
                                            <h3 class="product-name">${p.name}</h3>
                                            <div class="product-price">₹${p.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            document.getElementById('productDetailContent').innerHTML = detailHTML;
            showPage('productDetail');
        }

        function selectSize(element) {
            document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
        }

        function buyNowFromDetail(productIndex) {
            addToCart(productIndex);
            showPage('checkout');
            renderCheckout();
        }

        // Render Checkout Page
        let selectedPaymentMethod = 'card';

        function renderCheckout() {
            console.log("renderCheckout called");
            console.log("checkout cart:", cart);
            
            if (cart.length === 0) {
                document.getElementById('checkoutContainer').innerHTML = `
                    <div class="empty-state">
                        <h3>Your cart is empty</h3>
                        <p>Add items to your cart to proceed with checkout</p>
                        <button class="cta-button" onclick="showPage('marketplace')" style="margin-top: 2rem;">
                            Continue Shopping
                        </button>
                    </div>
                `;
                return;
            }

            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            let deliveryFee = 0;

            const checkoutHTML = `
                <div class="checkout-form reveal-left active">
                    <!-- PRODUCT SECTION -->
                    <div class="checkout-section">
                        <h3>Order Items</h3>
                        ${cart.map(item => `
                            <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); align-items: center;">
                                <div style="width: 60px; height: 60px; background: var(--bg-glass); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💎</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.3rem;">${item.name}</div>
                                    <div style="color: var(--grey-light); font-size: 0.85rem;">${item.metal} • ${item.carat}</div>
                                </div>
                                <div style="color: var(--gold); font-weight: 600;">₹${item.price.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- DELIVERY ADDRESS -->
                    <div class="checkout-section">
                        <h3>Delivery Address</h3>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="checkoutName" required placeholder="Enter your full name">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <textarea id="checkoutAddress" required placeholder="Enter full address" style="min-height: 80px; resize: none;"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" id="checkoutCity" required placeholder="City">
                            </div>
                            <div class="form-group">
                                <label>PIN Code</label>
                                <input type="text" id="checkoutPincode" required placeholder="Pincode" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            </div>
                        </div>
                    </div>

                    <!-- DELIVERY OPTIONS -->
                    <div class="checkout-section">
                        <h3>Delivery</h3>
                        <div class="form-group">
                            <select id="checkoutDelivery" onchange="updateCheckoutTotal()" style="width: 100%; padding: 1rem; background: rgba(26, 26, 26, 0.8); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 10px; color: var(--white); font-family: 'Montserrat', sans-serif;">
                                <option value="0">Standard Delivery (Free)</option>
                                <option value="100">Express Delivery (₹100)</option>
                            </select>
                        </div>
                    </div>

                    <!-- PAYMENT METHOD -->
                    <div class="checkout-section">
                        <h3>Payment Method</h3>
                        <div class="form-group">
                            <select id="checkoutPayment" style="width: 100%; padding: 1rem; background: rgba(26, 26, 26, 0.8); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 10px; color: var(--white); font-family: 'Montserrat', sans-serif;">
                                <option>Cash on Delivery</option>
                                <option>UPI</option>
                                <option>Credit Card</option>
                            </select>
                        </div>
                    </div>

                    <!-- TOTAL -->
                    <div class="checkout-section">
                        <div style="background: var(--bg-glass); backdrop-filter: blur(10px); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 15px; padding: 2rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Subtotal:</span>
                                <span>₹${subtotal.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Delivery:</span>
                                <span id="deliveryFeeDisplay">₹0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 600; color: var(--gold); border-top: 1px solid rgba(212, 175, 55, 0.2); padding-top: 1rem;">
                                <span>Total:</span>
                                <span id="checkoutTotal">₹${subtotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button class="cta-button" onclick="placeOrder()" style="width: 100%; margin-top: 2rem;">
                        Place Order
                    </button>
                </div>
            `;

            document.getElementById('checkoutContainer').innerHTML = checkoutHTML;
        }

        function updateCheckoutTotal() {
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const deliverySelect = document.getElementById('checkoutDelivery');
            const deliveryFee = parseInt(deliverySelect.value);
            const total = subtotal + deliveryFee;

            document.getElementById('deliveryFeeDisplay').textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString()}`;
            document.getElementById('checkoutTotal').textContent = `₹${total.toLocaleString()}`;
        }

        function selectPayment(element, method) {
            document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('selected'));
            element.classList.add('selected');
            selectedPaymentMethod = method;
        }

        function placeOrder() {
            // Validate form
            const name = document.getElementById('checkoutName').value.trim();
            const address = document.getElementById('checkoutAddress').value.trim();
            const city = document.getElementById('checkoutCity').value.trim();
            const pincode = document.getElementById('checkoutPincode').value.trim();
            const delivery = document.getElementById('checkoutDelivery').value;
            const payment = document.getElementById('checkoutPayment').value;

            if (!name || !address || !city || !pincode) {
                alert('Please fill all details!');
                return;
            }

            if (pincode.length !== 6) {
                alert('Pincode must be 6 digits!');
                return;
            }

            // Calculate delivery date
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + (delivery === '100' ? 2 : 7)); // Express: 2 days, Standard: 7 days
            const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const orderNumber = 'LJ' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const deliveryFee = parseInt(delivery);
            const total = subtotal + deliveryFee;

            // Show success message
            document.getElementById('checkoutContainer').innerHTML = `
                <div class="order-placed reveal-scale active">
                    <div class="success-icon">✓</div>
                    <h2 style="color: var(--gold); font-size: 3rem; margin-bottom: 1rem;">Order Placed Successfully!</h2>
                    <p style="color: var(--grey-light); font-size: 1.2rem; margin-bottom: 3rem;">
                        Thank you for your purchase, ${name}
                    </p>

                    <div style="background: var(--bg-glass); backdrop-filter: blur(10px); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 20px; padding: 3rem; max-width: 600px; margin: 0 auto; text-align: left;">
                        <div style="margin-bottom: 2rem;">
                            <div style="color: var(--grey-light); margin-bottom: 0.5rem;">Order Number</div>
                            <div style="color: var(--gold); font-size: 1.5rem; font-weight: 700;">${orderNumber}</div>
                        </div>

                        <div style="padding: 1.5rem; background: rgba(212, 175, 55, 0.05); border-radius: 10px; margin-bottom: 2rem;">
                            <h4 style="color: var(--gold); margin-bottom: 1rem;">Delivery Information</h4>
                            <p style="color: var(--white); line-height: 1.8;">
                                <strong>Estimated Delivery:</strong> ${deliveryDateStr}<br>
                                <strong>Shipping Address:</strong><br>
                                ${address}, ${city} - ${pincode}<br>
                                <strong>Delivery Type:</strong> ${delivery === '100' ? 'Express (₹100)' : 'Standard (Free)'}
                            </p>
                        </div>

                        <div style="border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <span style="color: var(--grey-light);">Total Amount Paid</span>
                                <span style="color: var(--gold); font-size: 1.5rem; font-weight: 700;">₹${total.toLocaleString()}</span>
                            </div>
                            <div style="color: var(--grey-light); font-size: 0.9rem;">
                                Payment Method: ${payment}
                            </div>
                        </div>

                        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(100, 255, 100, 0.05); border: 1px solid rgba(100, 255, 100, 0.2); border-radius: 10px;">
                            <p style="color: #66ff66; font-size: 0.9rem; text-align: center;">
                                ✓ Order confirmation sent to your email<br>
                                ✓ You can track your order using the order number<br>
                                ✓ ${delivery === '100' ? 'Express delivery within 2 days' : 'Standard delivery within 7 days'}
                            </p>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button class="cta-button" onclick="continueShoppingAfterOrder()" style="flex: 1;">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Clear cart
            cart = [];
            updateCart();
        }

        function continueShoppingAfterOrder() {
            showPage('marketplace');
        }