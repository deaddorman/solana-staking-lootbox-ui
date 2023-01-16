import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Pink Floyd NFT Collection</title>
        <meta name="description" content="Pink Floyd NFT Collection"/>
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
