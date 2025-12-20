package com.example.vidstreem.subscription

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.vidstreem.Data.Model.PlanDto
import com.example.vidstreem.R

class SubscriptionPlansAdapter(
    private val onSelect: (PlanDto) -> Unit
) : ListAdapter<PlanDto, SubscriptionPlansAdapter.VH>(DIFF) {

    companion object {
        val DIFF = object : DiffUtil.ItemCallback<PlanDto>() {
            override fun areItemsTheSame(a: PlanDto, b: PlanDto) = a.planId == b.planId
            override fun areContentsTheSame(a: PlanDto, b: PlanDto) = a == b
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_subscription_plan, parent, false)
        return VH(view, onSelect)
    }

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(getItem(position))

    class VH(itemView: View, private val onSelect: (PlanDto) -> Unit) :
        RecyclerView.ViewHolder(itemView) {

        private val tvName: TextView? = itemView.findViewById(R.id.plan_name)
        private val tvPrice: TextView? = itemView.findViewById(R.id.plan_price)
        private val tvDesc: TextView? = itemView.findViewById(R.id.plan_description)
//        private val tvMeta: TextView? = itemView.findViewById(R.id.tvPlanMeta)
        private val btnSelect: Button? = itemView.findViewById(R.id.btn_subscribe)

        fun bind(plan: PlanDto) {
            tvName?.text = plan.planName
            tvPrice?.text = "${plan.currency} ${plan.amount}"
            tvDesc?.text = plan.description

            val meta = buildString {
                append("${plan.billingInterval} ${plan.billingPeriod}")
                if (plan.adFree) append(" • Ad-free")
                if (plan.videoQuality.isNotBlank()) append(" • ${plan.videoQuality}")
                append(" • Devices: ${plan.maxDevices}")
                if (plan.downloadAllowed) append(" • Downloads")
            }
           // tvMeta?.text = meta

            itemView.setOnClickListener { onSelect(plan) }
            btnSelect?.setOnClickListener { onSelect(plan) }
        }
    }
}
