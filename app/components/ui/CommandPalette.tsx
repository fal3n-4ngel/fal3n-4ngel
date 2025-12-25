"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import {
  RiAwardLine,
  RiBriefcaseLine,
  RiCloseLine,
  RiCodeLine,
  RiFileDownloadLine,
  RiGithubLine,
  RiHomeLine,
  RiLinkedinLine,
  RiMailLine,
  RiSearchLine,
  RiUserLine,
} from "react-icons/ri";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: "Navigation" | "Social" | "Actions";
}

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
      setSearch("");
    }
  };

  const commands: Command[] = [
    {
      id: "home",
      label: "Go to Home",
      icon: <RiHomeLine className="h-5 w-5" />,
      action: () => scrollToSection("hero"),
      category: "Navigation",
    },
    {
      id: "about",
      label: "Go to About",
      icon: <RiUserLine className="h-5 w-5" />,
      action: () => scrollToSection("about"),
      category: "Navigation",
    },
    {
      id: "experience",
      label: "View Experience",
      icon: <RiBriefcaseLine className="h-5 w-5" />,
      action: () => scrollToSection("experience"),
      category: "Navigation",
    },
    {
      id: "projects",
      label: "Browse Projects",
      icon: <RiCodeLine className="h-5 w-5" />,
      action: () => scrollToSection("projects"),
      category: "Navigation",
    },
    {
      id: "awards",
      label: "View Awards",
      icon: <RiAwardLine className="h-5 w-5" />,
      action: () => scrollToSection("awards"),
      category: "Navigation",
    },
    {
      id: "email",
      label: "Send Email",
      icon: <RiMailLine className="h-5 w-5" />,
      action: () => {
        window.open("mailto:adithyakrishnan.test@gmail.com", "_blank");
        setIsOpen(false);
      },
      category: "Social",
    },
    {
      id: "github",
      label: "Open GitHub",
      icon: <RiGithubLine className="h-5 w-5" />,
      action: () => {
        window.open("https://github.com/fal3n-4ngel", "_blank");
        setIsOpen(false);
      },
      category: "Social",
    },
    {
      id: "linkedin",
      label: "Open LinkedIn",
      icon: <RiLinkedinLine className="h-5 w-5" />,
      action: () => {
        window.open("https://www.linkedin.com/in/adithya-krishnan-r/", "_blank");
        setIsOpen(false);
      },
      category: "Social",
    },
    {
      id: "resume",
      label: "Download Resume",
      icon: <RiFileDownloadLine className="h-5 w-5" />,
      action: () => {
        window.open("/Resume Adithya Krishnan.pdf", "_blank");
        setIsOpen(false);
      },
      category: "Actions",
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Toggle palette with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch("");
        setSelectedIndex(0);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
        setSelectedIndex(0);
      }

      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        }
        if (e.key === "Enter" && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex]!.action();
        }
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category]!.push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <>
      {/* Trigger hint - bottom right corner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-40 hidden md:block"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="interactable flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-all hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30"
        >
          <RiSearchLine className="h-4 w-4" />
          <span>Press</span>
          <kbd className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold dark:bg-black/30">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>
      </motion.div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[20vh] z-50 w-[90vw] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-[#1a1a1a]"
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200 dark:border-white/10">
                <RiSearchLine className="ml-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  autoFocus
                  className="w-full bg-transparent px-4 py-4 text-base outline-none placeholder:text-gray-400 dark:text-white"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="interactable mr-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <RiCloseLine className="h-5 w-5" />
                </button>
              </div>

              {/* Commands List */}
              <div className="command-palette-scroll max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No commands found</div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category} className="mb-4">
                      <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {cmds.map((cmd, idx) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          return (
                            <motion.button
                              key={cmd.id}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`interactable flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all ${
                                selectedIndex === globalIndex
                                  ? "bg-gray-100 dark:bg-white/10"
                                  : "hover:bg-gray-50 dark:hover:bg-white/5"
                              }`}
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                              <div className="text-gray-600 dark:text-gray-400">{cmd.icon}</div>
                              <span className="flex-1 text-sm font-medium dark:text-white">
                                {cmd.label}
                              </span>
                              {selectedIndex === globalIndex && (
                                <kbd className="rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold dark:bg-black/30">
                                  ↵
                                </kbd>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-white/10 dark:bg-black/20 dark:text-gray-400">
                <span>Navigate with ↑↓ arrows</span>
                <span>Press ESC to close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
