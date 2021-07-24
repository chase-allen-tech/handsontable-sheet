import DefaultErrorPage from 'next/error';

export default function Custom500() {
    return <DefaultErrorPage statusCode={500} />
}