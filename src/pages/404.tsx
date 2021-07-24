import DefaultErrorPage from 'next/error';

export default function Custom404() {
    return <DefaultErrorPage statusCode={404} />
}