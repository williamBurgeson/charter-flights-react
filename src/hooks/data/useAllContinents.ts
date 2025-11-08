import { useEffect, useState } from "react";

import type { Continent } from "../../models/continent.model";

export function useAllContinents() {

    const [data,setData] = useState<Continent[] | null>(null);
    const [error,setError] = useState<Error | null>(null);
    const [loading,setLoading] = useState<boolean>(false);

    useEffect(() => {
        (
            async function(){
                try{
                    setLoading(true)
                    const response = await fetch('/continents.json');
                    const data = await response.json();
                    setData(data);
                }catch(err: unknown){
                    setError(err as Error);
                }finally{
                    setLoading(false);
                }
            }
        )()
    }, [])

    return { data, error, loading }
}
