import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function Footer() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <footer ref={ref} className="bg-gray-900 text-white pt-16 pb-8">
      <div
        className={`reveal ${inView ? "visible" : ""} container mx-auto px-6 max-w-6xl`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold mb-4">ViOlympicKids</h2>
            <p className="text-gray-400 max-w-sm">{t.footer.brandDesc}</p>
          </div>

          {/* Company links */}
          <div>
            <h4
              className="font-bold text-lg mb-4"
              style={{ color: "var(--brand-primary)" }}
            >
              {t.footer.companyTitle}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  {t.footer.companyLinks.about}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.companyLinks.careers}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.companyLinks.privacy}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h4
              className="font-bold text-lg mb-4"
              style={{ color: "var(--brand-primary)" }}
            >
              {t.footer.contactTitle}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>hello@violympickids.com</li>
              <li>+84 123 456 789</li>
              <li className="flex gap-4 mt-4 text-2xl">
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                  title="Facebook"
                >
                  📘
                </a>
                <a
                  href="#"
                  className="hover:text-pink-400 transition-colors"
                  title="Instagram"
                >
                  📷
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-600 text-sm">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
