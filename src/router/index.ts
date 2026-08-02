import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/views/Layout.vue'
import RouterViewContainer from '@/views/RouterViewContainer.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    redirect: '/settings/basic/department',
    children: [
      {
        path: 'plan',
        name: 'MasterPlan',
        component: () => import('@/views/plan/MasterPlan.vue'),
        meta: { title: '主计划', titleKey: 'routes.plan.masterPlan', icon: 'Calendar' }
      },
      {
        path: 'process',
        name: 'ProcessManagement',
        meta: { title: '工艺管理', titleKey: 'routes.process.root', icon: 'Operation' },
        component: RouterViewContainer,
        children: [
          {
            path: 'material',
            name: 'Material',
            component: () => import('@/views/system/master-data/Material.vue'),
            meta: { title: '物料主数据', titleKey: 'routes.process.material' }
          },
          {
            path: 'process-docs/files',
            name: 'ProcessFiles',
            component: () => import('@/views/system/process-docs/ProcessFiles.vue'),
            meta: { title: '工艺文件', titleKey: 'routes.process.processFiles', icon: 'Files' }
          }
        ]
      },
      {
        path: 'extrusion',
        name: 'ExtrusionProduction',
        meta: { title: '挤压生产', titleKey: 'routes.extrusion.root', icon: 'Finished' },
        component: RouterViewContainer,
        children: [
          {
            path: 'scheduling',
            name: 'IssueScheduling',
            component: () => import('@/views/extrusion/IssueScheduling.vue'),
            meta: { title: '下发排程', titleKey: 'routes.extrusion.scheduling' }
          },
          {
            path: 'extrusion-workbench',
            name: 'ExtrusionWorkbench',
            component: () => import('@/views/extrusion/ExtrusionWorkbench.vue'),
            meta: { title: '挤压工作台', titleKey: 'routes.extrusion.extrusionWorkbench' }
          },
          {
            path: 'sawing-workbench',
            name: 'SawingWorkbench',
            component: () => import('@/views/extrusion/SawingWorkbench.vue'),
            meta: { title: '锯切工作台', titleKey: 'routes.extrusion.sawingWorkbench' }
          },
          {
            path: 'aging-workbench',
            name: 'AgingWorkbench',
            component: () => import('@/views/extrusion/AgingWorkbench.vue'),
            meta: { title: '时效工作台', titleKey: 'routes.extrusion.agingWorkbench' }
          },
          {
            path: 'cutting-workbench',
            name: 'CuttingWorkbench',
            component: () => import('@/views/extrusion/CuttingWorkbench.vue'),
            meta: { title: '裁切工作台', titleKey: 'routes.extrusion.cuttingWorkbench' }
          },
          {
            path: 'packaging-workbench',
            name: 'PackagingWorkbench',
            component: () => import('@/views/extrusion/PackagingWorkbench.vue'),
            meta: { title: '包装工作台', titleKey: 'routes.extrusion.packagingWorkbench' }
          },
          {
            path: 'pending-storage',
            name: 'PendingStorageList',
            component: () => import('@/views/extrusion/PendingStorageList.vue'),
            meta: { title: '待入库清单', titleKey: 'routes.extrusion.pendingStorage' }
          },
          {
            path: 'traceability',
            name: 'ProductionTraceability',
            component: () => import('@/views/extrusion/ProductionTraceability.vue'),
            meta: { title: '全过程追溯', titleKey: 'routes.extrusion.traceability', hidden: true }
          },
          {
            path: 'defective-control',
            name: 'DefectiveControl',
            component: () => import('@/views/quality/ipqc/DefectiveControl.vue'),
            meta: { title: '不良品管控', titleKey: 'routes.extrusion.defectiveControl' }
          }
        ]
      },
      {
        path: 'mold',
        name: 'MoldManagement',
        meta: { title: '模具管理', titleKey: 'routes.mold.root', icon: 'Tools' },
        component: RouterViewContainer,
        children: [
          {
            path: 'list',
            name: 'MoldList',
            component: () => import('@/views/mold/MoldList.vue'),
            meta: { title: '模具列表', titleKey: 'routes.mold.list' }
          },
          {
            path: 'dashboard',
            name: 'UsageDashboard',
            component: () => import('@/views/mold/UsageDashboard.vue'),
            meta: { title: '使用状况看板', titleKey: 'routes.mold.dashboard' }
          }
        ]
      },
      {
        path: 'quality',
        name: 'QualityManagement',
        meta: { title: '质量管理', titleKey: 'routes.quality.root', icon: 'Aim' },
        component: RouterViewContainer,
        children: [
          {
            path: 'ipqc-module',
            name: 'IPQCModule',
            meta: { title: 'IPQC', titleKey: 'routes.quality.ipqc.root' },
            component: RouterViewContainer,
            children: [
              {
                path: 'workbench',
                name: 'IPQCWorkbench',
                component: () => import('@/views/quality/ipqc/IPQCWorkbench.vue'),
                meta: { title: 'IPQC工作台', titleKey: 'routes.quality.ipqc.workbench', ipqcView: 'workbench' }
              },
              {
                path: 'tasks',
                name: 'IPQCTasks',
                component: () => import('@/views/quality/ipqc/IPQCWorkbench.vue'),
                meta: { title: '检验任务', titleKey: 'routes.quality.ipqc.tasks', ipqcView: 'tasks' }
              },
              {
                path: 'leader-review',
                name: 'IPQCLeaderReview',
                component: () => import('@/views/quality/ipqc/IPQCWorkbench.vue'),
                meta: { title: '班长审核', titleKey: 'routes.quality.ipqc.leaderReview', ipqcView: 'reviews' }
              },
              {
                path: 'records',
                name: 'IPQCRecords',
                component: () => import('@/views/quality/ipqc/IPQCWorkbench.vue'),
                meta: { title: '检验记录', titleKey: 'routes.quality.ipqc.records', ipqcView: 'records' }
              },
              {
                path: 'exceptions',
                name: 'IPQCExceptions',
                component: () => import('@/views/quality/ipqc/IPQCWorkbench.vue'),
                meta: { title: '质量异常', titleKey: 'routes.quality.ipqc.exceptions', ipqcView: 'exceptions' }
              },
              {
                path: 'inspection-config',
                name: 'InspectionConfig',
                component: () => import('@/views/quality/InspectionConfig.vue'),
                meta: { title: '检验方案', titleKey: 'routes.quality.ipqc.plans' }
              },
              {
                path: 'spc',
                name: 'IPQCSpc',
                component: () => import('@/views/quality/ipqc/IPQCSpc.vue'),
                meta: { title: 'SPC趋势分析', titleKey: 'routes.quality.ipqc.spc' }
              }
            ]
          },
          {
            path: 'sample-testing',
            name: 'SampleTestingModule',
            meta: { title: '样品检测', titleKey: 'routes.quality.sampleTesting.root' },
            component: RouterViewContainer,
            children: [
              {
                path: 'cnc-sample',
                name: 'CNCSamplePreparation',
                component: () => import('@/views/quality/CNCSamplePreparation.vue'),
                meta: { title: 'CNC制样&收样', titleKey: 'routes.quality.sampleTesting.cncSample' }
              },
              {
                path: 'lab-testing',
                name: 'LabTesting',
                component: () => import('@/views/quality/LabTesting.vue'),
                meta: { title: '实验室', titleKey: 'routes.quality.sampleTesting.labTesting' }
              }
            ]
          }
        ]
      },
      {
        path: 'reports',
        name: 'ReportAnalysis',
        meta: { title: '报表分析', titleKey: 'routes.reports.root', icon: 'PieChart' },
        component: RouterViewContainer,
        children: [
          {
            path: 'extrusion',
            name: 'ReportExtrusion',
            meta: { title: '挤压报表', titleKey: 'routes.reports.extrusion.root' },
            component: RouterViewContainer,
            children: [
              {
                path: 'production',
                name: 'ReportExtrusionProduction',
                component: () => import('@/views/reports/extrusion/ExtrusionReport.vue'),
                meta: { title: '挤压生产', titleKey: 'routes.reports.extrusion.production' }
              },
              {
                path: 'cutting',
                name: 'ReportCuttingProduction',
                component: () => import('@/views/reports/extrusion/CuttingReport.vue'),
                meta: { title: '裁切生产', titleKey: 'routes.reports.extrusion.cutting' }
              }
            ]
          }
        ]
      },
      {
        path: 'equipment',
        name: 'EquipmentManagement',
        meta: { title: '设备管理', titleKey: 'routes.equipment.root', icon: 'Odometer' },
        component: RouterViewContainer,
        children: [
          {
            path: 'frame',
            name: 'FrameManagement',
            component: () => import('@/views/equipment/FrameManagement.vue'),
            meta: { title: '料框管理', titleKey: 'routes.equipment.frame' }
          },
          {
            path: 'measuring',
            name: 'MeasuringEquipment',
            meta: { title: '监视与测量设备管理', titleKey: 'routes.equipment.measuring' },
            component: RouterViewContainer,
            children: [
              {
                path: 'ledger',
                name: 'LedgerManagement',
                component: () => import('@/views/equipment/measuring/LedgerManagement.vue'),
                meta: { title: '台账管理', titleKey: 'routes.equipment.measuringSub.ledger' }
              },
              {
                path: 'project',
                name: 'CalibrationProject',
                component: () => import('@/views/equipment/measuring/CalibrationProject.vue'),
                meta: { title: '校验项目管理', titleKey: 'routes.equipment.measuringSub.project' }
              },
              {
                path: 'template',
                name: 'CalibrationTemplate',
                component: () => import('@/views/equipment/measuring/CalibrationTemplate.vue'),
                meta: { title: '校验模板管理', titleKey: 'routes.equipment.measuringSub.template' }
              },
              {
                path: 'task',
                name: 'CalibrationTask',
                component: () => import('@/views/equipment/measuring/CalibrationTask.vue'),
                meta: { title: '校验任务管理', titleKey: 'routes.equipment.measuringSub.task' }
              },
              {
                path: 'reminder',
                name: 'CalibrationReminder',
                component: () => import('@/views/equipment/measuring/CalibrationReminder.vue'),
                meta: { title: '校验提醒管理', titleKey: 'routes.equipment.measuringSub.reminder' }
              }
            ]
          }
        ]
      },
      {
        path: 'reports',
        name: 'ReportAnalysis',
        meta: { title: '报表分析', titleKey: 'routes.reports.root', icon: 'PieChart' },
        component: RouterViewContainer,
        children: [
          {
            path: 'extrusion',
            name: 'ReportExtrusion',
            meta: { title: '挤压报表', titleKey: 'routes.reports.extrusion.root' },
            component: RouterViewContainer,
            children: [
              {
                path: 'production',
                name: 'ReportExtrusionProduction',
                component: () => import('@/views/reports/extrusion/ExtrusionReport.vue'),
                meta: { title: '挤压生产', titleKey: 'routes.reports.extrusion.production' }
              },
              {
                path: 'cutting',
                name: 'ReportCuttingProduction',
                component: () => import('@/views/reports/extrusion/CuttingReport.vue'),
                meta: { title: '裁切生产', titleKey: 'routes.reports.extrusion.cutting' }
              }
            ]
          }
        ]
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        meta: { title: '系统设置', titleKey: 'routes.settings.root', icon: 'Setting' },
        component: RouterViewContainer,
        children: [
          {
            path: 'basic',
            name: 'BasicInfo',
            meta: { title: '基础信息', titleKey: 'routes.settings.basic.root', icon: 'User' },
            component: RouterViewContainer,
            children: [
              {
                path: 'department',
                name: 'Department',
                component: () => import('@/views/system/basic/Department.vue'),
                meta: { title: '部门信息', titleKey: 'routes.settings.basic.department' }
              },
              {
                path: 'user',
                name: 'User',
                component: () => import('@/views/system/basic/User.vue'),
                meta: { title: '用户信息', titleKey: 'routes.settings.basic.user' }
              },
              {
                path: 'position',
                name: 'Position',
                component: () => import('@/views/system/basic/Position.vue'),
                meta: { title: '岗位信息', titleKey: 'routes.settings.basic.position' }
              },
              {
                path: 'team',
                name: 'Team',
                component: () => import('@/views/system/basic/Team.vue'),
                meta: { title: '班组信息', titleKey: 'routes.settings.basic.team' }
              }
            ]
          },
          {
            path: 'permission',
            name: 'Permission',
            meta: { title: '权限配置', titleKey: 'routes.settings.permission.root', icon: 'Lock' },
            component: RouterViewContainer,
            children: [
              {
                path: 'role',
                name: 'Role',
                component: () => import('@/views/system/permission/Role.vue'),
                meta: { title: '角色管理', titleKey: 'routes.settings.permission.role' }
              },
              {
                path: 'operation',
                name: 'OperationAuth',
                component: () => import('@/views/system/permission/Operation.vue'),
                meta: { title: '操作权限', titleKey: 'routes.settings.permission.operation' }
              },
              {
                path: 'management',
                name: 'ManagementAuth',
                component: () => import('@/views/system/permission/Management.vue'),
                meta: { title: '管理权限', titleKey: 'routes.settings.permission.management' }
              }
            ]
          },
          {
            path: 'logs',
            name: 'Logs',
            meta: { title: '操作日志', titleKey: 'routes.settings.logs.root', icon: 'Document' },
            component: RouterViewContainer,
            children: [
              {
                path: 'normal',
                name: 'NormalLog',
                component: () => import('@/views/system/logs/NormalLog.vue'),
                meta: { title: '正常日志', titleKey: 'routes.settings.logs.normal' }
              },
              {
                path: 'exception',
                name: 'ExceptionLog',
                component: () => import('@/views/system/logs/ExceptionLog.vue'),
                meta: { title: '异常日志', titleKey: 'routes.settings.logs.exception' }
              },
              {
                path: 'interface',
                name: 'InterfaceLog',
                component: () => import('@/views/system/logs/InterfaceLog.vue'),
                meta: { title: '接口日志', titleKey: 'routes.settings.logs.interface' }
              }
            ]
          },
          {
            path: 'code-rules',
            name: 'CodeRuleConfig',
            component: () => import('@/views/system/code-rules/CodeRuleConfig.vue'),
            meta: { title: '编码规则配置', titleKey: 'routes.settings.codeRules', icon: 'Key' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
