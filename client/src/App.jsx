import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import SmoothScroll from './lib/SmoothScroll.jsx'
import { TransitionProvider } from './lib/transition.jsx'
import { ThemeProvider } from './lib/theme.jsx'
import { ToastProvider } from './lib/toast.jsx'
import { WardrobeProvider } from './lib/wardrobe.jsx'
import { SearchProvider } from './lib/search.jsx'

import Grain from './components/Grain.jsx'
import Preloader from './components/Preloader.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import BackToTop from './components/BackToTop.jsx'

import Home from './pages/Home.jsx'
import Collections from './pages/Collections.jsx'
import Product from './pages/Product.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Category from './pages/Category.jsx'
import NotFound from './pages/NotFound.jsx'

const SEO = {
  '/': ['Barira Handicrafts — Manufacturer & Exporter', 'Premium metal handicrafts and decor exporter from India.'],
  '/collections': ['Curated Collections — Barira Handicrafts', 'Explore our curated series of handcrafted brass, cast iron, and decorative metalwork.'],
  '/about': ['About Us — Barira Handicrafts', 'Our story, heritage factory floor, and master artisans in Moradabad.'],
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
                <ScrollProgress />
                <Preloader onDone={() => setEntered(true)} />
                <Navbar />
                <main className="app">
                  <ErrorBoundary key={pathname}>
                    <Routes>
                      <Route path="/" element={<Home entered={entered} />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/product/:slug" element={<Product />} />
                      <Route path="/category/:slug" element={<Category />} />
                      <Route path="/about" element={<About />} />
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
