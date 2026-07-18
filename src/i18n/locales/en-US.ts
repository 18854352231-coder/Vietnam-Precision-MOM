import { enTask5Literal } from './task5Literals'
import { enTask6QualityLiteral } from './task6QualityLiterals'
import { enTask7ReportSystemLiteral } from './task7ReportSystemLiterals'
import { enTask8Literal } from './task8CastingLiterals'

export default {
  common: {
    appName: 'Vietnam MOM System',
    actions: {
      search: 'Search',
      reset: 'Reset',
      confirm: 'Confirm',
      cancel: 'Cancel'
    }
  },
  layout: {
    home: 'Home',
    language: 'Language',
    user: {
      admin: 'Administrator',
      profile: 'Profile',
      logout: 'Log out'
    }
  },
  routes: {
    plan: {
      masterPlan: 'Master Plan'
    },
    process: {
      root: 'Process Management',
      material: 'Material Master Data',
      processFiles: 'Process Files'
    },
    casting: {
      root: 'Casting Production',
      scheduling: 'Scheduling',
      meltingWorkbench: 'Melting Workbench',
      castingWorkbench: 'Casting Workbench',
      homogenizingWorkbench: 'Homogenizing Workbench',
      sawingWorkbench: 'Sawing Workbench'
    },
    extrusion: {
      root: 'Extrusion Production',
      scheduling: 'Scheduling',
      extrusionWorkbench: 'Extrusion Workbench',
      sawingWorkbench: 'Sawing Workbench',
      agingWorkbench: 'Aging Workbench',
      cuttingWorkbench: 'Cutting Workbench',
      packagingWorkbench: 'Packaging Workbench',
      pendingStorage: 'Pending Storage List',
      defectiveControl: 'Defective Control'
    },
    mold: {
      root: 'Mold Management',
      list: 'Mold List',
      dashboard: 'Usage Dashboard'
    },
    quality: {
      root: 'Quality Management',
      ipqc: {
        root: 'IPQC',
        processInspection: 'Process Inspection',
        extrusion: 'Extrusion IPQC',
        aging: 'Aging IPQC',
        cuttingFeed: 'Cutting Feed IPQC',
        cutting: 'Cutting IPQC',
        prePackaging: 'Pre-packaging IPQC',
        leaderReview: 'Leader Review',
        processQualityInspection: 'Process Quality Inspection',
        inspectionConfig: 'Product Inspection Config'
      },
      sampleTesting: {
        root: 'Sample Testing',
        cncSample: 'CNC Sampling & Receiving',
        labTesting: 'Laboratory'
      }
    },
    equipment: {
      root: 'Equipment Management',
      tooling: 'Tooling Management',
      frame: 'Frame Management',
      measuring: 'Monitoring & Measuring Equipment',
      measuringSub: {
        ledger: 'Ledger Management',
        project: 'Calibration Project Management',
        template: 'Calibration Template Management',
        task: 'Calibration Task Management',
        reminder: 'Calibration Reminder Management'
      }
    },
    reports: {
      root: 'Reports',
      extrusion: {
        root: 'Extrusion Reports',
        production: 'Extrusion Production',
        cutting: 'Cutting Production'
      },
      casting: 'Casting Reports'
    },
    settings: {
      root: 'System Settings',
      basic: {
        root: 'Basic Information',
        department: 'Department',
        user: 'User',
        position: 'Position',
        team: 'Team'
      },
      permission: {
        root: 'Permission Settings',
        role: 'Role Management',
        operation: 'Operation Permission',
        management: 'Management Permission'
      },
      logs: {
        root: 'Operation Logs',
        normal: 'Normal Logs',
        exception: 'Exception Logs',
        interface: 'API Logs'
      },
      codeRules: 'Code Rule Configuration'
    }
  },
  pages: {
    processInspection: {
      messages: {
        invalidProductOrRules: 'Please ensure a valid product name is entered and inspection rules are loaded (for example: Custom aluminum profile A).',
        saveSuccess: 'Inspection record saved successfully',
        recordMissing: 'The record does not exist or has already been updated',
        leaderReviewUnavailable: 'The current record cannot be reviewed by the team leader',
        missingInspectionItems: 'Inspection item data is missing',
        leaderReviewSuccess: 'Leader review completed successfully'
      }
    },
    inspectionConfig: {
      messages: {
        importSuccess: 'Inspection rule file imported successfully: {fileName}',
        requiredProductInfo: 'Please enter the product code and name',
        requiredRules: 'Please add at least one inspection rule for {process}',
        updateSuccess: 'Updated inspection rules for [{productNo}] {process}',
        createSuccess: 'Created inspection rules for [{productNo}] {process}',
        clearSuccess: 'Cleared successfully'
      },
      confirm: {
        clearRules: 'Are you sure you want to clear the inspection rules for product {productNo} in [{process}]?',
        title: 'Prompt'
      }
    },
    cncSample: {
      messages: {
        returnBlocked: 'Some or all items for this sample have already been processed or delivered and cannot be returned',
        returnSuccess: 'Sample returned successfully and moved back to pending receiving',
        machiningFinishSuccess: 'Machining completion registered successfully',
        deliverySuccess: 'Sample delivered successfully and moved to lab pending receiving',
        validPreparationItemRequired: 'Please add at least one valid machining item',
        receiveSuccess: 'Sample receiving registered successfully and machining list generated',
        printSuccess: 'Print command sent'
      }
    },
    labTesting: {
      messages: {
        machineExists: 'Machine name already exists',
        addMachineSuccess: 'Added successfully',
        deleteMachineSuccess: 'Deleted successfully',
        registerSuccess: 'Registered successfully',
        sampleNotFound: 'Pending sample for registration not found',
        returnSuccess: 'Sample returned successfully',
        receiveSuccess: 'Sample received successfully'
      }
    },
    processFiles: {
      messages: {
        previewingFile: 'Previewing file: {fileName}',
        agingProgramRequired: 'Please enter the aging program',
        saveSuccess: 'Operation successful',
        deleteConfirm: 'Are you sure you want to delete file [{fileName}]?',
        deleteSuccess: 'Deleted successfully'
      }
    },
    masterPlan: {
      messages: {
        saveSuccess: 'Master plan saved successfully',
        deleteConfirm: 'Are you sure you want to delete order {orderNo}?',
        deleteSuccess: 'Deleted successfully',
        exportInProgress: 'Exporting master plan data...',
        importSuccess: 'File imported successfully: {fileName}'
      },
      validation: {
        orderNoRequired: 'Please enter the order number',
        leaderRequired: 'Please enter the owner',
        productNameRequired: 'Please enter the item name'
      }
    }
  },
  literal: {
    ...enTask5Literal,
    ...enTask6QualityLiteral,
    ...enTask7ReportSystemLiteral,
    ...enTask8Literal
  },
  status: {
    completed: 'Completed',
    pending: 'Pending',
    pendingLeaderReview: 'Pending Leader Review',
    idle: 'Idle',
    heating: 'Heating',
    holding: 'Holding',
    pass: 'Pass',
    fail: 'Fail'
  }
}
