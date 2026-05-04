"use client";

import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE_NAME } from "@/lib/utils/constants";
import TranslatableText from "@/components/ui/TranslatableText";
import { useLanguage } from "@/lib/context/LanguageContext";
import { Facebook, Twitter, Youtube, Instagram, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const SOCIAL_LINKS = [
    { icon: Facebook, href: "https://www.facebook.com/share/18ZKnv8veU/", name: "Facebook", color: "hover:bg-[#1877F2]" },
    { icon: Twitter, href: "https://x.com/SuhanimusicSuh1", name: "Twitter", color: "hover:bg-[#1DA1F2]" },
    { icon: Youtube, href: "https://www.youtube.com/@Sourabh84090", name: "Youtube", color: "hover:bg-[#FF0000]" },
    { icon: Instagram, href: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=110eklcv", name: "Instagram", color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
  ];

  return (
    <footer className="bg-[#0f1117] text-gray-200">
      {/* Top wave separator */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 h-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-[70px] h-[70px] flex-shrink-0 rounded-full overflow-hidden ring-[3px] ring-yellow-400 shadow-lg">
                <Image
                  src="/logo.jpg"
                  alt="STV News Bihar Jharkhand"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "50% 45%" }}
                  sizes="70px"
                />
              </div>
              <div>
                <h3 className="font-black text-white text-xl leading-tight">STV News</h3>
                <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider">
                  Bihar · Jharkhand
                </p>
                <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">
                  Aap Ko Rakhe Aage
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <TranslatableText tKey="aboutStv" />
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/80 text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-md ${s.color}`}
                >
                  <s.icon size={18} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest border-b border-gray-700 pb-2">
              <TranslatableText tKey="categories" />
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-red-500 transition-colors flex-shrink-0" />
                    {t(link.key || "") || link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest border-b border-gray-700 pb-2">
              <TranslatableText tKey="quickLinks" />
            </h4>
            <ul className="space-y-2">
              {[
                { labelHi: "हमारे बारे में", labelEn: "About Us", href: "#" },
                { labelHi: "संपर्क करें", labelEn: "Contact", href: "#" },
                { labelHi: "विज्ञापन", labelEn: "Advertise", href: "#" },
                { labelHi: "गोपनीयता नीति", labelEn: "Privacy Policy", href: "/privacy" },
                { labelHi: "उपयोग की शर्तें", labelEn: "Terms of Use", href: "/terms" },
                { labelHi: "साइटमैप", labelEn: "Sitemap", href: "/sitemap.xml" },
              ].map((l) => (
                <li key={l.labelEn}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-red-500 transition-colors flex-shrink-0" />
                    {t("home") === "Home" ? l.labelEn : l.labelHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest border-b border-gray-700 pb-2">
              <TranslatableText tKey="contactUs" />
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Jamshedpur, Jharkhand, India</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <Mail className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:stvnews2026@gmail.com" className="hover:text-red-400 transition-colors truncate">
                  stvnews2026@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <Phone className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+918409036486" className="hover:text-red-400 transition-colors">
                  +91 8409036486
                </a>
              </div>
            </div>

            {/* App badges */}

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            © {year}
            <span className="text-gray-300 font-bold">{SITE_NAME}</span>
            — All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
