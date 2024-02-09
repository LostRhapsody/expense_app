// returns an object containing links
export default function getBreadcrumbs(pages:any){

  // always start with Home, so we don't have to pass it in
  let breadCrumbs = [
    {
      label:"Home",
      icon:'i-heroicons-home-solid',
      to:"/"
    }
  ]
  // loop through pages passed in
  pages.forEach(function(page:any){
    breadCrumbs.push(
      {
        label:page.name,
        icon:page.icon,
        to:page.url
      }
    )
  });
  return breadCrumbs;
}