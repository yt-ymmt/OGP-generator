import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'

const DynamicPage: NextPage = () => {
    const router = useRouter()
    return <div>{router.query.dynamic} </div>
}

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = [...Array(10)].map((_, index) => ({
        params: {
            dynamic: `${index}`,
        },
    }))

    return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {},
    }
}

export default DynamicPage
