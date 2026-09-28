import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getDialects } from "../api/userApi";

export default function DialectDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialectGroups, setDialectGroups] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchDialects = async () => {
      try {
        const data = await getDialects();

        const grouped = data.reduce((acc, dialect) => {
          const existingGroup = acc.find(
            (group) => group.label === dialect.region,
          );

          if (existingGroup) {
            existingGroup.options.push(dialect);
          } else {
            acc.push({
              label: dialect.region,
              options: [dialect],
            });
          }

          return acc;
        }, []);

        setDialectGroups(grouped);
        if (!value) {
          const defaultDialect = data.find((d) =>
            d.name.startsWith("Литературен"),
          );
          if (defaultDialect && onChange) {
            onChange(defaultDialect.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDialects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (dialect) => {
    onChange(dialect.id);
    setIsOpen(false);
  };

  const currentSelectedObj = dialectGroups
    ?.flatMap((g) => g.options)
    .find((d) => d.id === value);

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Дијалект
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between w-full h-10 px-3 text-sm
            bg-background border rounded-lg transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            hover:border-foreground/30 mt-1
            ${
              isOpen
                ? "border-foreground/30 ring-2 ring-ring ring-offset-2"
                : "border-input"
            }
          `}
        >
          <span
            className={
              currentSelectedObj ? "text-foreground" : "text-muted-foreground"
            }
          >
            {currentSelectedObj?.name || "Избери дијалект..."}
          </span>

          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="p-1.5 max-h-72 overflow-y-auto">
              {dialectGroups.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <div className="h-px bg-border mx-1 my-1.5" />}

                  <p className="px-2.5 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </p>

                  {group.options.map((dialect) => {
                    const isSelected = value === dialect.id;

                    return (
                      <button
                        key={dialect.id}
                        type="button"
                        onClick={() => handleSelect(dialect)}
                        className={`
                          relative flex items-center w-full px-2.5 py-1.5 text-sm rounded-md
                          transition-colors duration-100 text-left
                          ${
                            isSelected
                              ? "bg-primary/8 text-primary font-medium"
                              : "text-popover-foreground hover:bg-accent/10 hover:text-accent-foreground"
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}

                        {dialect.name}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
