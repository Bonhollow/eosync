import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useEmployees() {
    const { data, error, isLoading } = useSWR('http://localhost:8000/employees', fetcher);
    return {
        employees: data,
        isLoading,
        isError: error
    };
}
