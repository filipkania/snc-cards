import Link from "next/link";
import styles from "./Footer.module.scss";
import { motion } from "framer-motion";

const Footer = ({ hidden = true }: { hidden?: boolean }) => {
    const opacity = hidden ? 0 : 1;
    return (
        <motion.div 
            layout 
            initial={{ opacity: 0 }} 
            animate={{ opacity }} 
            transition={{
                delay: hidden ? 0 : 0.6
            }}
            className={styles.container}>
            <span className={styles.text}>
                Made with ❤️ by <Link href={"https://github.com/snacksncode"}>snacksncode</Link>
            </span>
        </motion.div>
    );
};

export default Footer;
