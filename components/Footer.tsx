import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">AskChad</h3>
            <p className="text-sm mb-4">
              Marketing ROI Calculator - Data-driven insights for optimizing your ad spend and maximizing returns.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>[Business Address]</p>
                  <p>[City, State ZIP]</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+15555555555" className="hover:text-white transition-colors">
                  (555) 555-5555
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:support@askchad.net" className="hover:text-white transition-colors">
                  support@askchad.net
                </a>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/sms-terms" className="hover:text-white transition-colors">
                  SMS Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} AskChad / Marketing ROI Calculator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
