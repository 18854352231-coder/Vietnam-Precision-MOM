import { zhTask5Literal } from './task5Literals'
import { zhTask6QualityLiteral } from './task6QualityLiterals'
import { zhTask7ReportSystemLiteral } from './task7ReportSystemLiterals'
import { zhTask8Literal } from './task8CastingLiterals'

export default {
  common: {
    appName: '越南MOM系统',
    actions: {
      search: '搜索',
      reset: '重置',
      confirm: '确认',
      cancel: '取消'
    }
  },
  layout: {
    home: '首页',
    language: '语言',
    user: {
      admin: '管理员',
      profile: '个人中心',
      logout: '退出登录'
    }
  },
  routes: {
    plan: {
      masterPlan: '主计划'
    },
    process: {
      root: '工艺管理',
      material: '物料主数据',
      processFiles: '工艺文件'
    },
    casting: {
      root: '熔铸生产',
      scheduling: '下发排程',
      meltingWorkbench: '熔炼工作台',
      castingWorkbench: '铸造工作台',
      homogenizingWorkbench: '均质工作台',
      sawingWorkbench: '锯切工作台'
    },
    extrusion: {
      root: '挤压生产',
      scheduling: '下发排程',
      extrusionWorkbench: '挤压工作台',
      sawingWorkbench: '锯切工作台',
      agingWorkbench: '时效工作台',
      cuttingWorkbench: '裁切工作台',
      packagingWorkbench: '包装工作台',
      pendingStorage: '待入库清单',
      defectiveControl: '不良品管控'
    },
    mold: {
      root: '模具管理',
      list: '模具列表',
      dashboard: '使用状况看板'
    },
    quality: {
      root: '质量管理',
      ipqc: {
        root: 'IPQC',
        processInspection: '制程检验',
        extrusion: '挤压IPQC',
        aging: '时效IPQC',
        cuttingFeed: '裁切上料IPQC',
        cutting: '裁切IPQC',
        prePackaging: '预包装IPQC',
        leaderReview: '班长审核',
        processQualityInspection: '工序质检',
        inspectionConfig: '产品检验配置'
      },
      sampleTesting: {
        root: '样品检测',
        cncSample: 'CNC制样&收样',
        labTesting: '实验室'
      }
    },
    equipment: {
      root: '设备管理',
      tooling: '工装管理',
      frame: '料框管理'
    },
    reports: {
      root: '报表分析',
      extrusion: {
        root: '挤压报表',
        production: '挤压生产',
        cutting: '裁切生产'
      },
      casting: '熔铸报表'
    },
    settings: {
      root: '系统设置',
      basic: {
        root: '基础信息',
        department: '部门信息',
        user: '用户信息',
        position: '岗位信息',
        team: '班组信息'
      },
      permission: {
        root: '权限配置',
        role: '角色管理',
        operation: '操作权限',
        management: '管理权限'
      },
      logs: {
        root: '操作日志',
        normal: '正常日志',
        exception: '异常日志',
        interface: '接口日志'
      },
      codeRules: '编码规则配置'
    }
  },
  pages: {
    processInspection: {
      messages: {
        invalidProductOrRules: '请确保输入了有效的产品名称并加载了检验规则(例如：定制铝型材A款)',
        saveSuccess: '检验记录保存成功',
        recordMissing: '记录不存在或已被更新',
        leaderReviewUnavailable: '当前记录不能执行班长审核',
        missingInspectionItems: '缺少检测项目数据',
        leaderReviewSuccess: '班长审核成功'
      }
    },
    inspectionConfig: {
      messages: {
        importSuccess: '成功导入检验规则文件: {fileName}',
        requiredProductInfo: '请输入产品编号和名称',
        requiredRules: '请至少添加一项 {process} 的检验规则',
        updateSuccess: '成功更新 [{productNo}] 的 {process} 检验规则',
        createSuccess: '成功创建 [{productNo}] 的 {process} 检验规则',
        clearSuccess: '清空成功'
      },
      confirm: {
        clearRules: '确定要清空产品 {productNo} 在 [{process}] 的检验规则吗？',
        title: '提示'
      }
    },
    cncSample: {
      messages: {
        returnBlocked: '该样品的部分或全部项目已加工/送样，无法退样',
        returnSuccess: '退样成功，已退回待收样',
        machiningFinishSuccess: '加工完成登记成功',
        deliverySuccess: '送样成功，已流转至实验室待收样',
        validPreparationItemRequired: '请至少添加一个有效的加工项目',
        receiveSuccess: '收样登记成功，已生成加工列表',
        printSuccess: '打印指令已发送'
      }
    },
    labTesting: {
      messages: {
        machineExists: '机台名称已存在',
        addMachineSuccess: '添加成功',
        deleteMachineSuccess: '删除成功',
        registerSuccess: '登记成功',
        sampleNotFound: '未找到待登记的样品',
        returnSuccess: '退样成功',
        receiveSuccess: '收样成功'
      }
    },
    processFiles: {
      messages: {
        previewingFile: '正在预览文件: {fileName}',
        agingProgramRequired: '请输入时效制度',
        saveSuccess: '操作成功',
        deleteConfirm: '确定要删除文件 [{fileName}] 吗？',
        deleteSuccess: '删除成功'
      }
    },
    masterPlan: {
      messages: {
        saveSuccess: '主计划保存成功',
        deleteConfirm: '确认删除订单 {orderNo} 吗?',
        deleteSuccess: '删除成功',
        exportInProgress: '正在导出主计划数据...',
        importSuccess: '成功导入文件: {fileName}'
      },
      validation: {
        orderNoRequired: '请输入订单编号',
        leaderRequired: '请输入负责人',
        productNameRequired: '请输入品名'
      }
    }
  },
  literal: {
    ...zhTask5Literal,
    ...zhTask6QualityLiteral,
    ...zhTask7ReportSystemLiteral,
    ...zhTask8Literal
  },
  status: {
    completed: '已完成',
    pending: '未完成',
    pendingLeaderReview: '待班长审核',
    idle: '空闲中',
    heating: '升温中',
    holding: '保温中',
    pass: '合格',
    fail: '不合格'
  }
}
