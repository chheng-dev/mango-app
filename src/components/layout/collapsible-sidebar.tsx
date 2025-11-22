import { useSidebar } from "@/hooks/useSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function CollapsibleSidebar() {
  const { sidebarGroups } = useSidebar();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div
      className={
        `bg-white border-r border-gray-200 h-screen transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        flex flex-col`
      }
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'}
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {
          sidebarGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">{group.title}
                </h3>
              )}
              <div className="spyace-y-1">
                {
                  group.items.map((item) => {
                    const isActive = item.path ? pathname === item.path : false;
                   if (isCollapsed) {
                      return (
                        <Link
                          key={item.id}
                          href={item.path || '#'}
                          className={`
                            flex items-center justify-center p-3 rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                          title={item.label}
                        >
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                        </Link>
                      );
                   }

                    return (
                      <Link
                        key={item.id}
                        href={item.path || '#'}
                        className={`
                          flex items-center p-3 rounded-lg transition-colors
                          ${isActive 
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700' 
                            : 'hover:bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {item.icon && <span className="mr-3 text-lg">{item.icon}</span>}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ); 
                  })
                }
              </div>
            </div>
          ))
        }
      </nav>
    </div>
  )
}