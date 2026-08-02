import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import { buildSlide02 } from "./slide-02.mjs";
import { buildSlide06 } from "./slide-06.mjs";
import { buildSlide11 } from "./slide-11.mjs";
import { buildSlide13 } from "./slide-13.mjs";
import { buildSlide17 } from "./slide-17.mjs";
import { buildSlide18 } from "./slide-18.mjs";
import { buildSlide26 } from "./slide-26.mjs";

const OUTPUT_DIR = "D:/越南MOM/MOM/.codex-tmp/pending-storage-ppt/rendered";
const FINAL_PPTX = "D:/越南MOM/MOM/待入库清单模块会议评审.pptx";

const title = (value) => value;
const body = (heading, detail) => ({
  titleHere: heading,
  loremIpsumDolorSitAmetConsecteturAdipiscing: `\n${detail}`,
});
const point = (heading, detail) => ({
  titleGoesHere: heading,
  loremIpsumDolorSitAmetConsecteturAdipiscing: `\n${detail}`,
});

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  buildSlide02(presentation, {
    title: title("MOM 系统"),
    title2: title("会议评审材料"),
    title3: title("待入库清单模块\n现状评审与优化决策"),
  });

  buildSlide06(presentation, {
    footer1: "02",
    title: title("流程已经连通，但尚未形成正式库存闭环"),
    body1: body("能走通", "包装打印后进入待称重，称重完成后进入待入库。"),
    body2: body("先拦风险", "质量未放行或重量不准确时，仍可能被允许入库。"),
    body3: body("再补底座", "需要后端库存事务、操作审计和多用户一致性。"),
  });

  buildSlide17(presentation, {
    footer1: "03",
    title: title("当前主流程由三个状态动作串联"),
    label1: "包装输出",
    label2: "称重校验",
    label3: "入库确认",
    body1: body("打印触发", "打印确认后生成待称重记录。"),
    body2: body("重量计算", "录入总重与皮重，计算净重后转为待入库。"),
    body3: body("库位落点", "选择成品库位后，记录状态变为已入库。"),
  });

  buildSlide11(presentation, {
    footer1: "04",
    title: title("页面完成了操作闭环，系统边界仍停留在浏览器内"),
    body1: {
      topic: "当前能力\n",
      loremIpsumDolorSitAmetConsecteturAdipiscing: "查询、称重、净重计算、库位选择、标识卡打印均已具备。\n",
      loremIpsumDolorSitAmetConsecteturAdipiscing2: "重复打印采用栈板编号覆盖更新，避免简单重复记录。",
    },
    body2: "页面状态可操作",
    body3: "库存事实未落账",
    body4: {
      detailGoesHere: "待称重 → 待入库\n",
      detailGoesHere2: "称重规则有基础校验\n",
      detailGoesHere3: "查询维度较完整",
    },
    body5: {
      detailGoesHere: "数据仅保存在 localStorage\n",
      detailGoesHere2: "没有入库单与库存台账\n",
      detailGoesHere3: "已入库记录无页面入口",
    },
  });

  buildSlide13(presentation, {
    footer1: "05",
    title: title("四个问题决定模块能否用于正式入库"),
    body1: point("P0｜质量未拦截", "NG 或未判定数据仍可能进入成品库。"),
    body2: point("P0｜重量不准确", "皮重默认 1.5kg，未继承实际栈板皮重。"),
    body3: point("P1｜关键字段断链", "排程类型、客户料号等数据未完整传递。"),
    body4: point("P1｜库存没有落账", "入库只改变页面状态，没有库存事务与审计。"),
  });

  buildSlide11(presentation, {
    footer1: "06",
    title: title("数据准确性要从“默认值”改为“来源可追溯”"),
    body1: {
      topic: "重点不是增加更多输入框，而是明确每个字段的唯一来源。\n",
      loremIpsumDolorSitAmetConsecteturAdipiscing: "栈板编号作为全流程关联键；重量、质量、排程类型和客户料号必须沿业务链持续保留。\n",
      loremIpsumDolorSitAmetConsecteturAdipiscing2: "人工修改需要记录原因、操作人和时间。",
    },
    body2: "当前断点",
    body3: "目标规则",
    body4: {
      detailGoesHere: "皮重固定默认值\n",
      detailGoesHere2: "客户料号映射内部料号\n",
      detailGoesHere3: "排程类型在入库前丢失",
    },
    body5: {
      detailGoesHere: "继承实际皮重并校验偏差\n",
      detailGoesHere2: "客户料号与内部料号分开\n",
      detailGoesHere3: "三类排程类型贯穿到仓库",
    },
  });

  buildSlide18(presentation, {
    footer1: "07",
    title: title("建议分三阶段完成：先正确，再可靠，最后集成"),
    body1: body("业务正确性", "增加质量放行门槛；修复皮重、客户料号和排程类型；补充已入库记录。"),
    body2: body("系统可靠性", "改为后端接口；生成入库单和库存台账；记录操作人、时间与变更日志。"),
    body3: body("设备与系统集成", "接电子秤及偏差规则；对接WMS/ERP；补齐批量操作与权限。"),
    label1: "第一阶段",
    label2: "第二阶段",
    label3: "第三阶段",
  });

  buildSlide26(presentation, {
    title: title("会议决策"),
    title2: title("本次会议需要确认"),
    title3: {
      loremIpsumDetails: "质量放行门槛",
      loremIpsumDetails2: "重量取数与偏差规则",
      loremIpsumDetails3: "后端库存及 WMS 对接范围",
    },
  });

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(`${OUTPUT_DIR}/${stem}.png`, await presentation.export({ slide, format: "png", scale: 1 }));
    await fs.writeFile(`${OUTPUT_DIR}/${stem}.layout.json`, await (await slide.export({ format: "layout" })).text());
  }

  await writeBlob(`${OUTPUT_DIR}/montage.webp`, await presentation.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
