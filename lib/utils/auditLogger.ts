import { createServiceClient } from '@/lib/supabase/server'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditParams {
  userId: string
  userNama: string
  aksi: AuditAction
  tabelTarget: string
  idTarget: string | number
  dataLama?: Record<string, unknown> | null
  dataBaru?: Record<string, unknown> | null
}

export async function writeAuditLog(params: AuditParams) {
  try {
    const supabase = await createServiceClient()
    const { error } = await supabase.from('audit_logs').insert({
      user_id:     params.userId,
      user_nama:   params.userNama,
      aksi:        params.aksi,
      tabel_target: params.tabelTarget,
      id_target:   String(params.idTarget),
      data_lama:   params.dataLama ?? null,
      data_baru:   params.dataBaru ?? null,
    })

    if (error) console.error('[AuditLog] Error:', error.message)
  } catch (err) {
    console.error('[AuditLog] Unexpected error:', err)
  }
}
