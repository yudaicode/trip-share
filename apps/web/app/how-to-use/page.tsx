"use client"

import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  BookOpen,
  PlusCircle,
  Share2,
  Users,
  Heart,
  MessageCircle,
  Search,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  MapPin,
  Camera,
  Bookmark
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    id: 1,
    title: "アカウント登録",
    description: "無料でアカウントを作成して、タビネタの全機能を利用しましょう",
    icon: Users,
    color: "from-blue-400 to-blue-600",
    details: [
      "メールアドレスまたはSNSアカウントで簡単登録",
      "プロフィール設定で自己紹介を追加",
      "旅行の好みやスタイルを設定"
    ]
  },
  {
    id: 2,
    title: "旅行プランを作成",
    description: "直感的な操作で素敵な旅行プランを作成できます",
    icon: PlusCircle,
    color: "from-green-400 to-emerald-600",
    details: [
      "旅行先、日程、参加人数を設定",
      "日ごとのスケジュールを詳細に計画",
      "写真やメモを追加してプランを豊かに",
      "予算設定で費用管理も可能"
    ]
  },
  {
    id: 3,
    title: "プランを共有",
    description: "作成したプランを友達や家族、コミュニティと共有しましょう",
    icon: Share2,
    color: "from-purple-400 to-pink-600",
    details: [
      "公開範囲を選択（公開・限定公開・非公開）",
      "SNSやメッセージアプリで簡単シェア",
      "QRコードでオフラインでも共有可能",
      "共同編集で一緒にプランを作成"
    ]
  },
  {
    id: 4,
    title: "他の人のプランを発見",
    description: "コミュニティの旅行プランから新しいインスピレーションを得よう",
    icon: Search,
    color: "from-orange-400 to-red-600",
    details: [
      "カテゴリーや地域で絞り込み検索",
      "人気ランキングやおすすめプランをチェック",
      "レビューや評価を参考に選択",
      "気に入ったプランをブックマーク"
    ]
  }
]

const features = [
  {
    icon: Calendar,
    title: "スケジュール管理",
    description: "日程ごとに詳細なスケジュールを作成・管理できます",
  },
  {
    icon: MapPin,
    title: "位置情報連携",
    description: "地図と連携して訪問場所を視覚的に管理",
  },
  {
    icon: Camera,
    title: "写真・動画投稿",
    description: "思い出の写真や動画を投稿してプランを充実",
  },
  {
    icon: Heart,
    title: "いいね・コメント",
    description: "他のユーザーと交流してプランをより良く",
  },
  {
    icon: Bookmark,
    title: "ブックマーク",
    description: "気に入ったプランを保存していつでも参照",
  },
  {
    icon: Star,
    title: "評価システム",
    description: "実際に旅行したプランに評価とレビューを投稿",
  }
]

const faqs = [
  {
    question: "タビネタは無料で使えますか？",
    answer: "はい、基本機能はすべて無料でご利用いただけます。アカウント登録から旅行プランの作成・共有まで、すべて無料です。"
  },
  {
    question: "作成したプランは他の人に見られますか？",
    answer: "プライバシー設定で公開範囲を選択できます。「公開」「限定公開」「非公開」から選んで、安心してご利用ください。"
  },
  {
    question: "旅行プランをコピーして使えますか？",
    answer: "はい、他のユーザーの公開プランをベースにして、自分だけのプランを作成できます。カスタマイズも自由に行えます。"
  },
  {
    question: "オフラインでも使えますか？",
    answer: "一部機能はオフラインでも利用可能です。事前にプランをダウンロードしておけば、旅行先でもスケジュールを確認できます。"
  },
  {
    question: "グループでプランを共同編集できますか？",
    answer: "はい、招待機能を使って友達や家族と一緒にプランを編集できます。リアルタイムで変更が反映されます。"
  }
]

export default function HowToUsePage() {
  const [activeStep, setActiveStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header />

      <div className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              使い方ガイド
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                タビネタの使い方
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              初めての方でも簡単に使える、旅行プラン作成・共有の完全ガイド。
              4つのステップで素敵な旅のネタをシェアしましょう。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              4つのステップで始めよう
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      activeStep === step.id
                        ? 'bg-white shadow-lg ring-2 ring-blue-500'
                        : 'bg-white/60 hover:bg-white hover:shadow-md'
                    }`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color}`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          Step {step.id}. {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                      {activeStep === step.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="lg:sticky lg:top-8">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  {steps.map((step) =>
                    activeStep === step.id && (
                      <div key={step.id}>
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6`}>
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                        <p className="text-gray-600 mb-6">{step.description}</p>
                        <ul className="space-y-3">
                          {step.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              主な機能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              よくある質問
            </h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-4"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full bg-white rounded-xl p-6 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <div className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <p className="text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">
                さあ、始めましょう！
              </h2>
              <p className="text-xl mb-8 opacity-90">
                あなたの素敵な旅のネタを作成して、みんなとシェアしよう
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    無料で始める
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    プランを探す
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}