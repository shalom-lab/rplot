"""Publish the reproducible ggplot2 examples into the image catalog."""
import json
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[1]
catalog_path = root / 'catalog.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))

# Each tuple: output batch, filename stem, Chinese title, category, search tags.
items = [
 ('r-demo','01-distribution','三组响应分布：小提琴与观测点','临床分布',['小提琴图','箱线图','模拟数据']),
 ('r-demo','02-volcano','差异表达火山图示例','火山图',['差异表达','火山图','模拟数据']),
 ('r-demo','03-forest','亚组风险比森林图示例','森林图',['亚组分析','风险比','模拟数据']),
 ('r-demo','04-heatmap','分组基因表达热图示例','热图',['表达热图','标准化','模拟数据']),
 ('r-demo','05-trend','纵向响应曲线与置信带','药代动力学',['趋势图','置信区间','模拟数据']),
 ('batch-02','06-pca','PCA 分组散点与置信椭圆','多元分析',['PCA','置信椭圆','模拟数据']),
 ('batch-02','07-roc','双模型 ROC 曲线示例','模型评估',['ROC','模型比较','模拟数据']),
 ('batch-02','08-paired','配对样本前后变化图','临床分布',['配对数据','个体变化','模拟数据']),
 ('batch-02','09-agreement','Bland–Altman 方法一致性图','模型评估',['一致性','Bland–Altman','模拟数据']),
 ('batch-02','10-correlation','相关系数气泡矩阵示例','相关分析',['相关矩阵','气泡图','模拟数据']),
 ('reference-12','01-stacked-proportions','汽车气缸数与挡位堆叠比例图','分布展示',['堆叠比例','分类数据','mtcars']),
 ('reference-12','02-raincloud','鸢尾花萼片长度雨云图','分布展示',['雨云图','密度','iris']),
 ('reference-12','03-faceted-histogram','鸢尾花萼片长度分面直方图','分布展示',['分面','直方图','iris']),
 ('reference-12','04-density-overlay','鸢尾花萼片长度叠加密度图','分布展示',['密度图','分组','iris']),
 ('reference-12','05-violin-observations','鸢尾花萼片长度小提琴散点图','临床分布',['小提琴图','观测点','iris']),
 ('reference-12','06-overlaid-histograms','鸢尾花萼片长度重叠直方图','分布展示',['直方图','重叠分布','iris']),
 ('reference-12','07-binned-density','气温与臭氧浓度二维频数热图','流行病学',['二维频数','环境数据','airquality']),
 ('reference-12','08-grouped-boxplots','汽车油耗分组箱线图','临床分布',['分组箱线图','汽车数据','mtcars']),
 ('reference-12','09-density-means','植物干重分组密度与均值图','分布展示',['密度图','均值','PlantGrowth']),
 ('reference-12','10-labeled-scatter','汽车重量与油耗标注散点图','相关分析',['散点图','标签','mtcars']),
 ('reference-12','11-box-jitter','植物干重箱线散点图','临床分布',['箱线图','散点','PlantGrowth']),
 ('reference-12','12-donut','汽车气缸数环形构成图','排名图',['环形图','构成比','mtcars']),
]

entries = {fig['id']: fig for fig in catalog['figures']}
for batch, stem, title, category, tags in items:
    source = root / 'outputs' / batch / f'{stem}.png'
    if not source.is_file():
        raise FileNotFoundError(source)
    identifier = f'ggplot-{batch}-{stem}'
    dest = root / 'figures' / f'{identifier}.png'
    shutil.copyfile(source, dest)
    dataset = '模拟数据' if batch != 'reference-12' else 'R 内置观测数据'
    script = 'scripts/ggplot-figures.R'
    entries[identifier] = {
        'id': identifier,
        'file': f'figures/{dest.name}',
        'title': title,
        'source_url': f'outputs/{batch}/{stem}.png',
        'paper_or_site': f'https://github.com/shalom-lab/rplot/blob/main/{script}',
        'license': '项目自制 ggplot2 示例',
        'category': category,
        'tags': tags,
        'multipanel': False,
        'note_zh': f'{dataset}；用 ggplot2 绘制。对应数据和生成脚本保存在仓库 outputs/{batch}/ 与 {script}。仅作图型参考，不代表论文结果。',
        'added': '2026-11-04',
        'data_type': 'simulated' if batch != 'reference-12' else 'R built-in observations',
    }

catalog['figures'] = list(entries.values())
catalog['figure_count'] = len(catalog['figures'])
catalog['categories'] = sorted({fig['category'] for fig in catalog['figures']})
catalog['updated'] = '2026-11-04'
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f"Published {len(items)} examples; total {catalog['figure_count']} figures")
