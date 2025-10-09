"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, X, Plus, Upload, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  enableServerUpload?: boolean
  showLabel?: boolean
  label?: string
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  enableServerUpload = false,
  showLabel = true,
  label = "写真"
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 画像圧縮関数
  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new window.Image()

      img.onload = () => {
        // アスペクト比を保持して最大幅に調整
        const aspectRatio = img.height / img.width
        canvas.width = Math.min(img.width, maxWidth)
        canvas.height = canvas.width * aspectRatio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (images.length >= maxImages) {
      setError(`最大${maxImages}枚までアップロード可能です`)
      return
    }

    setError(null)
    const remainingSlots = maxImages - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    if (enableServerUpload) {
      setUploading(true)
      setUploadProgress(0)

      try {
        for (let i = 0; i < filesToProcess.length; i++) {
          const file = filesToProcess[i]

          if (!file.type.startsWith('image/')) {
            setError('画像ファイルのみアップロード可能です')
            continue
          }

          // 画像圧縮
          let fileToUpload: File | Blob = file
          if (file.size > 1 * 1024 * 1024) { // 1MB以上の場合は圧縮
            try {
              fileToUpload = await compressImage(file)
            } catch (compressionError) {
              console.warn('画像圧縮に失敗しました、元のファイルを使用します:', compressionError)
            }
          }

          // ファイルサイズチェック (圧縮後も5MB超過の場合)
          if (fileToUpload.size > 5 * 1024 * 1024) {
            setError(`ファイルサイズが大きすぎます (5MB以下): ${file.name}`)
            continue
          }

          const formData = new FormData()
          formData.append('file', fileToUpload, file.name)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            const newImages = [...images, result.imageUrl]
            onImagesChange(newImages)
          } else {
            const error = await response.json()
            setError(`アップロードに失敗しました: ${error.error}`)
          }

          // プログレス更新
          setUploadProgress(((i + 1) / filesToProcess.length) * 100)
        }
      } catch (error) {
        console.error('アップロードエラー:', error)
        setError('アップロードに失敗しました')
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    } else {
      // Base64プレビュー用
      filesToProcess.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              const newImages = [...images, e.target.result]
              onImagesChange(newImages)
            }
          }
          reader.readAsDataURL(file)
        } else {
          setError('画像ファイルのみアップロード可能です')
        }
      })
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} ({images.length}/{maxImages})
        </label>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* プログレスバー */}
      {uploading && uploadProgress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">アップロード中...</span>
            <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 画像プレビューグリッド */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-blue-200 transition-colors">
                <Image
                  src={image}
                  alt={`アップロード画像 ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600 hover:scale-110"
                title="画像を削除"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* アップロードエリア */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center py-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
            ) : dragActive ? (
              <Upload className="h-8 w-8 text-blue-500 mb-2" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600 mb-1">
              {uploading
                ? "アップロード中..."
                : dragActive
                ? "ファイルをドロップしてください"
                : "画像をドラッグ&ドロップまたはクリックして選択"
              }
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP (1MB以上は自動圧縮) • 最大{maxImages}枚
            </p>
          </div>
        </div>
      )}

      {/* 追加ボタン（モバイル向け） */}
      {images.length < maxImages && (
        <div className="mt-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileSelector}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {uploading ? "アップロード中..." : `写真を追加 (${images.length}/${maxImages})`}
          </Button>
        </div>
      )}
    </div>
  )
}