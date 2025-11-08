import { useEffect, useState } from "react";

import type { Territory } from "../../models/territory.model";

export function useAllTerritories() {

    const [data,setData] = useState<Territory[] | null>(null);
    const [error,setError] = useState<Error | null>(null);
    const [loading,setLoading] = useState<boolean>(false);

    useEffect(() => {
        (
            async function(){
                try{
                    setLoading(true)
                    const response = await fetch('/territories.json');
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
