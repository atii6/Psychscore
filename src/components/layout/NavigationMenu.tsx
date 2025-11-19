import { Link, useLocation } from "react-router-dom";
import NAVIGATION_ITEMS from "@/utilitites/constants/navigationItems";

function NavigationMenu() {
  const location = useLocation();
  return (
    <div className="flex-1 p-4">
      <div className="space-y-2">
        <p
          className="text-xs font-medium uppercase tracking-wider px-2 py-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Navigation
        </p>
        <div className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.url
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavigationMenu;
