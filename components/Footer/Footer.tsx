import Link from "next/link";
import styles from "./Footer.module.scss";

const Footer = () => {
    return (
        <div className={styles.container}>
            <span className={styles.text}>
                Made with ❤️ by <Link href={"https://github.com/snacksncode"}>snacksncode</Link>
            </span>
        </div>
    );
};

export default Footer;
