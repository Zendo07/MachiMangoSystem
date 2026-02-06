import Navbar from '@/components/navbar';
import HeroSection from '@/components/heroSection';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full gradient-mango blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-mint-fresh blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-overline text-tropical-green mb-4 block">
              OUR MENU
            </span>
            <h2 className="text-h1 text-neutral-900 mb-4">
              Tropical Flavors
            </h2>
            <p className="text-body-xl text-neutral-700 max-w-2xl mx-auto">
              Discover our signature shakes, each crafted with fresh mangoes and
              love
            </p>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Classic Mango Graham',
                price: '₱120',
                description:
                  'Our signature blend of fresh mangoes, cream, and crushed graham crackers',
                popular: true,
                emoji: '🥭',
              },
              {
                name: 'Premium Mango Float',
                price: '₱150',
                description:
                  'Layered with extra cream, condensed milk, and premium mangoes',
                popular: true,
                emoji: '✨',
              },
              {
                name: 'Tropical Fusion',
                price: '₱140',
                description:
                  'Mango mixed with pineapple and coconut cream for island vibes',
                popular: false,
                emoji: '🍹',
              },
              {
                name: 'Mango Matcha Twist',
                price: '₱160',
                description:
                  'A unique blend of sweet mango with earthy matcha notes',
                popular: false,
                emoji: '🍵',
              },
              {
                name: 'Graham Crunch Delight',
                price: '₱130',
                description:
                  'Extra graham crackers with mango cream and caramel drizzle',
                popular: false,
                emoji: '🍪',
              },
              {
                name: 'Mango Boba Surprise',
                price: '₱145',
                description:
                  'Classic shake with chewy mango-flavored boba pearls',
                popular: false,
                emoji: '🧋',
              },
            ].map((item, index) => (
              <div
                key={item.name}
                className="group relative bg-gradient-cream rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {item.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-mango-gold text-white text-body-xs font-bold rounded-full">
                      <span>⭐</span>
                      <span>Popular</span>
                    </span>
                  </div>
                )}

                {/* Emoji Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>

                {/* Item Details */}
                <h3 className="text-h4 text-neutral-900 mb-2">{item.name}</h3>
                <p className="text-body text-neutral-700 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-h3 text-mango-gold font-bold">
                    {item.price}
                  </span>
                  <button className="btn btn-ghost btn-sm">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button className="btn btn-primary btn-lg btn-with-icon">
              <span>View Full Menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #FFF8E7 50%, #FFEFD5 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image/Visual Side */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-square bg-gradient-mango flex items-center justify-center">
                  <div className="text-center text-white p-12">
                    <div className="text-9xl mb-6 animate-float">🥭</div>
                    <h3 className="text-h2 mb-4">100% Fresh</h3>
                    <p className="text-body-lg">Philippine Mangoes</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-tropical-green rounded-full animate-bounce-slow shadow-xl flex items-center justify-center text-4xl">
                ✨
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cream-white rounded-full shadow-xl flex items-center justify-center text-5xl animate-float">
                🍃
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-6">
              <span className="text-overline text-tropical-green">
                OUR STORY
              </span>
              <h2 className="text-h1 text-neutral-900">
                Crafted with Love & Fresh Ingredients
              </h2>
              <div className="text-body-lg text-neutral-700 space-y-4">
                <p>
                  At Machi Mango, we believe in the perfect blend of tradition and
                  innovation. Each shake is carefully crafted using only the
                  freshest Philippine mangoes, sourced directly from local farms.
                </p>
                <p>
                  Our secret? A family recipe passed down through generations,
                  combined with premium cream and the perfect crunch of graham
                  crackers. Every sip is a celebration of tropical flavors.
                </p>
                <p>
                  From our humble beginnings at a small street cart to becoming a
                  beloved brand, our commitment remains the same: bringing smiles
                  one shake at a time.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                {[
                  '🌿 100% Natural',
                  '🥭 Farm Fresh',
                  '👨‍🍳 Handcrafted',
                  '💚 No Preservatives',
                ].map((feature) => (
                  <span
                    key={feature}
                    className="btn-pill"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <button className="btn btn-primary btn-lg mt-6">
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-overline text-tropical-green mb-4 block">
              FIND US
            </span>
            <h2 className="text-h1 text-neutral-900 mb-4">Visit Our Stores</h2>
            <p className="text-body-xl text-neutral-700 max-w-2xl mx-auto">
              Find your nearest Machi Mango location and taste the tropical
              goodness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                city: 'Manila',
                address: '123 Rizal Avenue, Ermita',
                hours: '10:00 AM - 10:00 PM',
                phone: '+63 917 123 4567',
              },
              {
                city: 'Quezon City',
                address: '456 Commonwealth Avenue',
                hours: '9:00 AM - 11:00 PM',
                phone: '+63 917 234 5678',
              },
              {
                city: 'Makati',
                address: '789 Ayala Avenue, Salcedo',
                hours: '10:00 AM - 10:00 PM',
                phone: '+63 917 345 6789',
              },
            ].map((location, index) => (
              <div
                key={location.city}
                className="bg-gradient-cream rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-mango rounded-full flex items-center justify-center mb-6 shadow-glow">
                  <span className="text-3xl">📍</span>
                </div>
                <h3 className="text-h3 text-neutral-900 mb-4">{location.city}</h3>
                <div className="space-y-3 text-body text-neutral-700">
                  <p className="flex items-start gap-2">
                    <span className="text-mango-gold">📍</span>
                    {location.address}
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-mango-gold">🕐</span>
                    {location.hours}
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-mango-gold">📞</span>
                    {location.phone}
                  </p>
                </div>
                <button className="btn btn-outline w-full mt-6">
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="py-24 relative overflow-hidden"
        style={{
          background: 'var(--gradient-mango)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full animate-float delay-300" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-md text-white mb-6 text-shadow-lg">
            Ready for a Taste of Paradise?
          </h2>
          <p className="text-body-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Order now and get your favorite Machi Mango shake delivered fresh to
            your door, or visit us at any of our locations!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn btn-secondary btn-xl btn-3d">
              Order Online
            </button>
            <button className="btn btn-ghost btn-xl text-white border-2 border-white hover:bg-white hover:text-mango-gold">
              Find Nearest Store
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-white">
              <div className="text-h2 font-bold mb-2">50K+</div>
              <div className="text-body-sm">Happy Customers</div>
            </div>
            <div className="text-white">
              <div className="text-h2 font-bold mb-2">15+</div>
              <div className="text-body-sm">Store Locations</div>
            </div>
            <div className="text-white">
              <div className="text-h2 font-bold mb-2">4.9★</div>
              <div className="text-body-sm">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Action Button */}
      <button className="btn-fab" aria-label="Quick Order">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </button>
    </div>
  );
}