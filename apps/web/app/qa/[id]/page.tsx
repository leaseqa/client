"use client";

import {useParams, useRouter} from "next/navigation";
import {useEffect} from "react";

export default function PostDetailRedirect() {
    const params = useParams();
    const router = useRouter();
    const postId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

    useEffect(() => {
        if (postId) {
            router.replace(`/qa?post=${postId}`);
        } else {
            router.replace("/qa");
        }
    }, [postId, router]);

    return (
        <div className="d-flex justify-content-center align-items-center loading-min-height">
            <div className="text-center">
                <div className="spinner-border text-primary mb-2" role="status"/>
                <div className="text-secondary">Redirecting…</div>
            </div>
        </div>
    );
}
