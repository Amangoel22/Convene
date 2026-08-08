export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { type: "spring", stiffness: 260, damping: 28 }
};

export const hoverAnimation = {
  y: -3,
  scale: 1.01
};

export const cardAnimation = {
  whileHover: {
    y: -3,
    scale: 1.01,
    backgroundColor: "rgba(240,240,240,0.72)",
    boxShadow: "0 14px 42px rgba(0,0,0,0.085)"
  },
  transition: { type: "spring", stiffness: 320, damping: 26, mass: 0.8 }
};

export const buttonAnimation = {
  whileHover: { y: -2, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 460, damping: 28 }
};

export const modalAnimation = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: "easeOut" }
};

export const sidebarAnimation = {
  transition: { type: "spring", stiffness: 280, damping: 28 }
};
