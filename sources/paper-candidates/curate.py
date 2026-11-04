"""Deterministic rectangular crops only; no generative changes to scientific figures."""
import json
from pathlib import Path
from PIL import Image, ImageOps
root=Path('sources/paper-candidates')
specs=[
 ('nature-regulator-bubbles','s41586-024-07234-1',4,'4b',(290,0,1140,600),'转录调控因子权重气泡图','基因组学',['气泡图','转录因子','调控网络']),
 ('nature-pseudotime-trends','s41586-024-07234-1',4,'4e',(1465,115,2142,995),'拟时序多层调控趋势图','基因组学',['拟时序','多层曲线','染色质']),
 ('ng-cell-colocalization-heatmap','s41588-024-01819-2',4,'4g',(1230,790,2130,1360),'细胞共定位双向聚类热图','热图',['聚类热图','注释条','空间组学']),
 ('ng-cross-species-similarity','s41588-024-01819-2',4,'4h',(1220,1360,2130,1844),'跨物种因子相似性矩阵','热图',['相似性矩阵','跨物种','聚类'])
]
cat=json.loads(Path('catalog.json').read_text(encoding='utf8'))
for id,article,num,panel,box,title,category,tags in specs:
 meta=json.loads((root/article/'provenance.json').read_text(encoding='utf8'))
 source=next(f for f in meta['figures'] if f['file']==f'figure-{num}.png')
 im=Image.open(root/article/source['file']).convert('RGB')
 # Panel b label sits above plot content; exclude it with a white margin-only patch.
 im=im.crop(box)
 if id in ('nature-regulator-bubbles','ng-cell-colocalization-heatmap','ng-cross-species-similarity'):
  from PIL import ImageDraw
  ImageDraw.Draw(im).rectangle((0,0,45 if id=='nature-regulator-bubbles' else 45,60 if id in ('nature-regulator-bubbles','ng-cross-species-similarity') else 35),fill='white')
 im=ImageOps.expand(im,border=16,fill='white');dest=f'figures/{id}.png';im.save(dest)
 entry=dict(id=id,file=dest,title=title,source_url=source['source_url'],paper_or_site=meta['article'],license='CC BY 4.0',category=category,tags=tags,multipanel=False,note_zh=f"来源：{meta['title']}，Fig. {panel}。原图矩形裁切，去除外围面板编号，未改动数据图形。CC BY 4.0（https://creativecommons.org/licenses/by/4.0/）。webR：仅图型适配候选，尚未运行验证。",added='2026-11-04',source_panel=panel,crop_box=list(box),webr_status='not-tested')
 entry['note_zh'] += ' 作者署名：' + ('Mannens et al.' if article.startswith('s41586') else 'Franzén et al.')
 cat['figures']=[f for f in cat['figures'] if f['id']!=id]+[entry]
cat['figure_count']=len(cat['figures']);cat['updated']='2026-11-04';cat['categories']=sorted(set(f['category'] for f in cat['figures']))
Path('catalog.json').write_text(json.dumps(cat,ensure_ascii=False,indent=2)+'\n',encoding='utf8')



