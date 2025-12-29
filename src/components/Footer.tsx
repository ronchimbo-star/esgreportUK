import { memo } from "react";
import { Link } from "wouter";
import { ESGReportLogo } from "@/components/ui/esgreport-logo";
import { TrafficLights } from "@/components/ui/traffic-lights";
import { FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-responsive">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <ESGReportLogo size="sm" theme="dark" />
            <p className="text-gray-300 text-sm mt-4">
              Professional ESG reporting platform for modern organizations.
            </p>
            <div className="mt-4">
              <TrafficLights size="md" animated />
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/frameworks">
                  <a className="text-gray-300 hover:text-white transition-colors">Frameworks</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/api">
                  <a className="text-gray-300 hover:text-white transition-colors">API</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/news">
                  <a className="text-gray-300 hover:text-white transition-colors">News</a>
                </Link>
              </li>
              <li>
                <Link href="/case-studies">
                  <a className="text-gray-300 hover:text-white transition-colors">Case Studies</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-300 hover:text-white transition-colors">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-gray-300 hover:text-white transition-colors">Support</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white transition-colors">About</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-300 hover:text-white transition-colors">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-300 hover:text-white transition-colors">Privacy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-300 hover:text-white transition-colors">Terms</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">Copyright © 2026 esgReport. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500">Partners:</span>
              <a
                href="https://esgreportai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                AI ESG Report Generator
              </a>
              <a
                href="https://greenregistry.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                GreenRegistry
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
