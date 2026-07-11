# stock_fund_flow.py
# 股票主力资金流向监控脚本
# 依赖库: pip install akshare pandas tabulate

import akshare as ak
import pandas as pd
from datetime import datetime

def get_top_fund_flow(top_n=10):
    print(f"正在获取今日 A 股资金流向数据... [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]")
    try:
        # 使用 AkShare 获取今日个股资金流向排行
        # 接口: stock_individual_fund_flow_rank (东方财富网-数据中心-资金流向-个股资金流向)
        df = ak.stock_individual_fund_flow_rank(indicator="今日")
        
        # 提取需要的列并进行重命名
        # 新版接口列名可能不同，打印出来看下
        # print("实际列名:", df.columns.tolist())
        
        # 兼容处理列名
        name_col = next((col for col in df.columns if '名称' in col or '简称' in col), None)
        pct_col = next((col for col in df.columns if '涨跌幅' in col), None)
        price_col = next((col for col in df.columns if '最新价' in col), None)
        net_flow_col = next((col for col in df.columns if '主力净流入' in col and '额' in col), None)
        
        cols_to_keep = ['代码']
        rename_dict = {'代码': '股票代码'}
        
        if name_col:
            cols_to_keep.append(name_col)
            rename_dict[name_col] = '股票名称'
        if price_col:
            cols_to_keep.append(price_col)
            rename_dict[price_col] = '最新价(元)'
        if pct_col:
            cols_to_keep.append(pct_col)
            rename_dict[pct_col] = '涨跌幅(%)'
        if net_flow_col:
            cols_to_keep.append(net_flow_col)
            rename_dict[net_flow_col] = '主力净流入净额(元)'
            
        df = df[cols_to_keep].rename(columns=rename_dict)
        
        # 将资金净额转换为“亿元”单位，方便阅读
        if '主力净流入净额(元)' in df.columns:
            # 确保数据为数值型
            df['主力净流入净额(元)'] = pd.to_numeric(df['主力净流入净额(元)'], errors='coerce')
            df['主力净流入(亿元)'] = (df['主力净流入净额(元)'] / 100000000).round(2)
            # 按主力净流入降序排列
            df = df.sort_values(by='主力净流入(亿元)', ascending=False).reset_index(drop=True)
            
            # 删除原始的元单位列
            df = df.drop(columns=['主力净流入净额(元)'])
        
        # 获取排名前 N 的股票
        top_df = df.head(top_n)
        
        print(f"\n========== 今日 A 股主力资金净流入排名前 {top_n} ==========")
        # 使用 tabulate 打印漂亮的表格
        try:
            from tabulate import tabulate
            print(tabulate(top_df, headers='keys', tablefmt='grid', showindex=False))
        except ImportError:
            # 如果没有安装 tabulate，使用 pandas 自带的打印
            print(top_df.to_string(index=False))
            
        print("\n* 数据来源: 东方财富网 (通过 AkShare 接口获取)")
        print("* 注意: 股市有风险，投资需谨慎。本数据仅供参考，不构成投资建议。")
        
    except Exception as e:
        print(f"获取数据失败，错误信息: {e}")

if __name__ == "__main__":
    get_top_fund_flow(top_n=10)
