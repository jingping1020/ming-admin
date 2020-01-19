<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        style="width: 200px;"
        class="filter-item"
        placeholder="请输入部门名称"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <el-table :data="list" :async="false" row-key="id" border>
      <el-table-column label="部门">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="删除标识">
        <template slot-scope="scope">
          <span v-if="scope.row.delFlag==0" style="color:red;">正常</span>
          <span v-if="scope.row.delFlag==1" style="color:green;">删除</span>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="排序">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.sort"
            size="mini"
            @change="handleChangeSort(scope.row.id, scope.row.sort)"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{ scope.row.remarks }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 300px; margin-left:50px;"
      >
        <el-form-item label="是否可用" prop="delFlag">
          <el-radio
            v-for="item in deleteDict"
            :key="'enabled' + item.label"
            v-model="temp.delFlag"
            :label="item.value"
          >{{ item.label }}</el-radio>
        </el-form-item>

        <el-form-item label="上级部门" prop="parentIds">
          <el-cascader
            v-model="temp.parentIds"
            :options="list"
            :props="treeProps"
            :show-all-levels="false"
            label="name"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.remarks"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">提交</el-button>
        <el-button v-else type="primary" @click="updateData">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listOrganization,
  createOrganization,
  deleteOrganization,
  updateOrganization,
  changeSort
} from '@/api/sys/organization'
import waves from '@/directive/waves' // 水波纹指令
import { deleteDict } from '@/utils/dict'

const defaultOrganization = {
  id: undefined,
  parentId: undefined,
  parentIds: undefined,
  remark: '',
  name: '',
  delFlag: false
}

export default {
  name: 'SysOrganization',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: null,
      listLoading: true,
      treeProps: {
        value: 'id',
        label: 'name',
        checkStrictly: true
      },
      listQuery: {
        keyword: ''
      },
      deleteDict: deleteDict,
      showReviewer: false,
      temp: defaultOrganization,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改机构',
        create: '添加机构'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listOrganization(this.listQuery).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },

    handleCreate() {
      this.temp = { ...defaultOrganization }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      // 预处理提交的数据
      const parentIds = this.temp.parentIds
      if (parentIds && parentIds !== '') {
        if (parentIds instanceof Array && parentIds.length > 0) {
          const parentId = parentIds[parentIds.length - 1]
          this.temp.parentId = parentId
        }
      }
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.temp.parentIds !== undefined && this.temp.parentIds !== '') {
            this.temp.parentIds = this.temp.parentIds.join('/')
          }
          createOrganization(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleChangeSort(rowId, value) {
      changeSort(rowId, value).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: response.message,
            type: 'success',
            duration: 2000
          })
          // this.getList()
        } else {
          this.$notify.error({
            title: '失败',
            message: response.message,
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj

      if (this.temp.parentIds) {
        let parentIds = this.temp.parentIds.trim()
        if (parentIds.endsWith('/')) {
          parentIds = parentIds.substr(0, parentIds.length - 1)
        }
        this.temp.parentIds = parentIds.split('/')
      }

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const parentIds = this.temp.parentIds
          if (parentIds && parentIds !== '') {
            if (parentIds instanceof Array && parentIds.length > 0) {
              const parentId = parentIds[parentIds.length - 1]
              this.temp.parentId = parentId
            }

            this.temp.parentIds = this.temp.parentIds.join('/')
          }
          const tempData = Object.assign({}, this.temp)
          updateOrganization(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认要删除菜单么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrganization(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    }
  }
}
</script>
