"use client";
import { useEffect } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export const useFacebookSdk = (appId: string) => {
  useEffect(() => {
    if (typeof window === 'undefined' || window.FB) return;

    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs?.parentNode?.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }, [appId]);
};
