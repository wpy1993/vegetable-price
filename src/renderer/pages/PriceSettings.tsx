import React, { useState, useEffect } from 'react'
import { storageService, PriceItem } from '../services/storage'

const PriceSettings: React.FC = () => {
  const [items, setItems] = useState<PriceItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 从本地文件读取数据
  const loadData = async () => {
    try {
      const data = await storageService.readData()
      setItems(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) return

    try {
      const newData = [...items, {
        id: Date.now(),
        name: newItem.name,
        price: Number(newItem.price)
      }]

      await storageService.writeData(newData)
      setItems(newData)
      setNewItem({ name: '', price: '' })
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const newData = items.filter(item => item.id !== id)
      await storageService.writeData(newData)
      setItems(newData)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleEdit = async (id: number, newName: string, newPrice: string) => {
    try {
      const newData = items.map(item =>
        item.id === id
          ? { ...item, name: newName, price: Number(newPrice) }
          : item
      )
      await storageService.writeData(newData)
      setItems(newData)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to edit item:', error)
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div className="price-settings">
      <h2>设置默认价格</h2>

      <div className="add-form">
        <input
          type="text"
          placeholder="菜品名称"
          value={newItem.name}
          onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="number"
          placeholder="价格"
          value={newItem.price}
          onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))}
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>菜品名称</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.name}
                    id={`name-${item.id}`}
                  />
                ) : (
                  item.name
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <input
                    type="number"
                    defaultValue={item.price}
                    id={`price-${item.id}`}
                  />
                ) : (
                  item.price
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById(`name-${item.id}`) as HTMLInputElement
                      const priceInput = document.getElementById(`price-${item.id}`) as HTMLInputElement
                      handleEdit(item.id, nameInput.value, priceInput.value)
                    }}
                  >
                    保存
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditingId(item.id)}>编辑</button>
                    <button onClick={() => handleDelete(item.id)}>删除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PriceSettings 