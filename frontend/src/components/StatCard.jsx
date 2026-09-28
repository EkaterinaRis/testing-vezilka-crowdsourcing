import { motion } from "framer-motion";

export default function StatCard({
  statValue,
  title,
  Icon,
  bgClass = "bg-warning/10",
  textClass = "text-warning",
  i = 0,
}) {
  return (
    <motion.div
      className="p-5 border bg-card border-border rounded-xl card-elevated"
      style={{ opacity: 1 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      <div
        className={`inline-flex p-2 mb-3 rounded-lg ${bgClass} ${textClass}`}
      >
        {Icon && <Icon className="w-4 h-4"></Icon>}
      </div>
      <div className="text-2xl font-bold">{statValue}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </motion.div>
  );
}
