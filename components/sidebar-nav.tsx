import Link from "next/link"

const navItems = [
  { title: "Search Questions", href: "/" },
  { title: "Browse Companies", href: "/companies" },
  { title: "Browse Roles", href: "/roles" },
  { title: "Add Question", href: "/add-question" },
  { title: "View All Questions", href: "/questions" },
]

export function SidebarNav() {
  return (
    <div className="w-64 bg-blue-600 text-white min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg">Interview Questions: by scaler community</h1>
          <div className="text-xs flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            <span>beta</span>
          </div>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

