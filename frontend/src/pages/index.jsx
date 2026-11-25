import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <Head>
        <title>Social Media Platform</title>
        <meta name="description" content="Connect with friends" />
      </Head>

      <div className={styles.container}>
        <div className={styles.mainContainer}>

          <div className={styles.mainContainer_left}>
            <p className={styles.heading}>
              Connect with Friends Without Exaggeration
            </p>

            <p className={styles.description}>
              A true social media platform, with stories, no bluff!
            </p>

            <div
              onClick={() => router.push("/login")}
              className={styles.ButtonJoin}
            >
              <p>Join Now</p>
            </div>
          </div>

          <div className={styles.mainContainer_right}>
            <img src="/images/homeMain_Connecting.png" alt="Home illustration" />
          </div>

        </div>
      </div>
    </UserLayout>
  );
}