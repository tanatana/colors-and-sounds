import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Colors And Sounds</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"></meta>
      </Head>

      <main>
        <ul>
        <li><Link href="pad">Swipe and play</Link></li>
        <li><Link href="keyboard">Tap and play</Link></li>
        </ul>
      </main>
    </div>
  )
}
