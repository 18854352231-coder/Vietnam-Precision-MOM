import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (relativePath) =>
  readFileSync(resolve('D:/越南MOM/MOM', relativePath), 'utf8')

test('all targeted workbenches reuse ProcessDocumentDialog', () => {
  const files = [
    ['src/views/extrusion/PackagingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/CuttingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/SawingWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/extrusion/ExtrusionWorkbench.vue', 'process-type="extrusion"'],
    ['src/views/casting/MeltingWorkbench.vue', 'process-type="casting"']
  ]

  for (const [file, processTypeMarker] of files) {
    const source = read(file)
    assert.equal(
      source.includes("import ProcessDocumentDialog from '@/components/ProcessDocumentDialog.vue'"),
      true,
      `${file} should import ProcessDocumentDialog`
    )
    assert.equal(
      source.includes('<ProcessDocumentDialog'),
      true,
      `${file} should render ProcessDocumentDialog`
    )
    assert.equal(
      source.includes(processTypeMarker),
      true,
      `${file} should pass ${processTypeMarker}`
    )
  }
})

test('legacy process document placeholder logic is removed from targeted workbenches', () => {
  const cutting = read('src/views/extrusion/CuttingWorkbench.vue')
  const sawing = read('src/views/extrusion/SawingWorkbench.vue')
  const extrusion = read('src/views/extrusion/ExtrusionWorkbench.vue')
  const melting = read('src/views/casting/MeltingWorkbench.vue')

  assert.equal(cutting.includes("ElMessageBox.alert('此处展示工艺文件PDF或图片'"), false)
  assert.equal(melting.includes("ElMessageBox.alert('此处展示工艺文件PDF或图片'"), false)
  assert.equal(sawing.includes("currentGenericOperation.value.key === 'processDoc'"), false)
  assert.equal(extrusion.includes("currentGenericOperation.value.key === 'processDoc'"), false)
})
