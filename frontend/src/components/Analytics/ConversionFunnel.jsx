import React from 'react'
import { Users, MessageSquare, Eye, Heart, DollarSign } from 'lucide-react'

const ConversionFunnel = ({ data }) => {
  const defaultData = [
    { stage: 'Leads', count: 1000, icon: Users, color: 'bg-blue-500', percentage: 100 },
    { stage: 'Contacted', count: 750, icon: MessageSquare, color: 'bg-green-500', percentage: 75 },
    { stage: 'Viewed Properties', count: 400, icon: Eye, color: 'bg-yellow-500', percentage: 40 },
    { stage: 'Interested', count: 200, icon: Heart, color: 'bg-orange-500', percentage: 20 },
    { stage: 'Converted', count: 50, icon: DollarSign, color: 'bg-red-500', percentage: 5 }
  ]

  const funnelData = data || defaultData

  return (
    <div className="space-y-4">
      {funnelData.map((stage, index) => {
        const nextStage = funnelData[index + 1]
        const conversionRate = nextStage ? ((nextStage.count / stage.count) * 100).toFixed(1) : null

        return (
          <div key={stage.stage} className="relative">
            {/* Stage Bar */}
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${stage.color} flex items-center justify-center flex-shrink-0`}>
                <stage.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">{stage.stage}</h4>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stage.count.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{stage.percentage}% of total</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stage.color}`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion Rate Arrow */}
            {conversionRate && (
              <div className="flex items-center justify-center mt-2 mb-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">{conversionRate}%</span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-3">Funnel Summary</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Overall Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              XAF {(funnelData[funnelData.length - 1].count * 15000000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversionFunnel
