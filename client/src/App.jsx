import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import SmoothScroll from './lib/SmoothScroll.jsx'
import { TransitionProvider } from './lib/transition.jsx'
import { ThemeProvider } from './lib/theme.jsx'
import { ToastProvider } from './lib/toast.jsx'
import { WardrobeProvider } from './lib/wardrobe.jsx'
import { SearchProvider } from './lib/search.jsx'

import Grain from './components/Grain.jsx'
import Cursor from './components/Cursor.jsx'
import Preloader from './components/Preloader.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import BackToTop from './components/BackToTop.jsx'

import Home from './pages/Home.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Product from './pages/Product.jsx'
import About from './pages/About.jsx'
import CustomOrders from './pages/CustomOrders.jsx'
import TradeFairs from './pages/TradeFairs.jsx'
import Blog from './pages/Blog.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

const SEO = {
  '/': ['Barira Handicrafts — Manufacturer & Exporter', 'Premium metal handicrafts and decor exporter from India.'],
  '/catalogue': ['Metalcraft Catalogue — Barira Handicrafts', 'Browse our export catalogue of handcrafted brass, copper, and iron products.'],
  '/about': ['About the Factory — Barira Handicrafts', 'A leading exporter of Indian handicrafts and decorative metalwork.'],
  '/custom-orders': ['Custom Manufacturing — Barira Handicrafts', 'Submit an inquiry for custom B2B manufacturing.'],
  '/trade-fairs': ['Trade Fairs — Barira Handicrafts', 'Visit our showcases at global trade fairs.'],
  '/blog': ['Blog — Barira Handicrafts', 'Insights into metalworking and our manufacturing process.'],
  '/contact': ['Contact Us — Barira Handicrafts', 'Get in touch with our export team and global offices.'],
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function useSeo(pathname) {
  useEffect(() => {
    const m = SEO[pathname]
    if (m) {
      document.title = m[0]
      setMeta('description', m[1])
    } else if (!pathname.startsWith('/product/')) {
      document.title = 'Barira Handicrafts — Manufacturer & Exporter'
    }
  }, [pathname])
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const { pathname } = useLocation()
  useSeo(pathname)

  return (
    <SmoothScroll>
      <TransitionProvider>
        <ThemeProvider>
          <ToastProvider>
            <WardrobeProvider>
              <SearchProvider>
                <Grain />
                <Cursor />
                <ScrollProgress />
                <Preloader onDone={() => setEntered(true)} />
                <Navbar />
                <main className="app">
                  <ErrorBoundary key={pathname}>
                    <Routes>
                      <Route path="/" element={<Home entered={entered} />} />
                      <Route path="/catalogue" element={<Catalogue />} />
                      <Route path="/product/:slug" element={<Product />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/custom-orders" element={<CustomOrders />} />
                      <Route path="/trade-fairs" element={<TradeFairs />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </main>
                <Footer />
                <CartDrawer />
                <BackToTop />
              </SearchProvider>
            </WardrobeProvider>
          </ToastProvider>
        </ThemeProvider>
      </TransitionProvider>
    </SmoothScroll>
  )
}
