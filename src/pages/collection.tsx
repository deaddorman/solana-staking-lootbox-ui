import type { NextPage } from "next"
import Head from "next/head"
import { CollectionView } from "../views"

const Collection: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Pink Floyd NFT Collection</title>
        <meta name="description" content="Basic Functionality" />
      </Head>
      <CollectionView />
    </div>
  )
}

export default Collection
