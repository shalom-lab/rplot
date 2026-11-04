import requests, json, pathlib, concurrent.futures
from bs4 import BeautifulSoup
root=pathlib.Path('sources/paper-candidates')
articles=['s41586-024-07234-1','s41586-024-07698-1','s41588-024-01819-2']
def collect(a):
 try:
  url='https://www.nature.com/articles/'+a
  r=requests.get(url,timeout=45);r.raise_for_status()
  s=BeautifulSoup(r.text,'html.parser');t=s.get_text(' ',strip=True)
  p=t.find('Rights and permissions');license=t[p:p+1600]
  folder=root/a;folder.mkdir(exist_ok=True)
  records=[]
  for i,f in enumerate(s.find_all('figure')[:6],1):
   im=f.find('img')
   if not im:continue
   src=im.get('src','');src=('https:'+src) if src.startswith('//') else src
   src=src.replace('/lw685/','/full/')
   caption=f.get_text(' ',strip=True)
   q=requests.get(src,timeout=45)
   if q.status_code==200 and q.headers.get('Content-Type','').startswith('image/'):
    name=f'figure-{i}.png';(folder/name).write_bytes(q.content)
    records.append(dict(file=name,source_url=src,caption=caption,status='original; not cropped; candidate'))
  (folder/'provenance.json').write_text(json.dumps(dict(article=url,title=s.title.get_text(),rights=license,figures=records,webr='Not tested; plotting suitability requires individual assessment'),ensure_ascii=False,indent=2),encoding='utf8')
  return a,len(records)
 except Exception as e:return a,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for result in pool.map(collect,articles):print(result,flush=True)
