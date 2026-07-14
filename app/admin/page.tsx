import Link from "next/link";
import { campaigns, magazines, stores } from "../../data/content";

export default function AdminPage() {
  const active = campaigns.filter((item) => item.active).length;
  return (
    <section className="admin-page">
      <header className="admin-header"><div><span className="eyebrow">Dashboard</span><h1>Visão geral</h1><p>Acompanhe os principais conteúdos e prepare a operação do site.</p></div><Link className="button" href="/admin/campanhas">Nova campanha</Link></header>
      <div className="dashboard-grid">
        <article><small>Campanhas ativas</small><strong>{active}</strong><span>de {campaigns.length} cadastradas</span></article>
        <article><small>Lojas publicadas</small><strong>{stores.length}</strong><span>em quatro cidades</span></article>
        <article><small>Revistas disponíveis</small><strong>{magazines.length}</strong><span>edições em destaque</span></article>
      </div>
      <div className="admin-panels">
        <section className="admin-card"><div className="admin-card-title"><h2>Campanhas vigentes</h2><Link href="/admin/campanhas">Gerenciar</Link></div>{campaigns.slice(0,3).map((item)=><div className="admin-list-row" key={item.id}><span className="status-dot"/><div><b>{item.title}</b><small>{item.eyebrow}</small></div><span className="badge">Ativa</span></div>)}</section>
        <section className="admin-card"><div className="admin-card-title"><h2>Próximas integrações</h2></div><ul className="roadmap-list"><li>Autenticação e perfis de acesso</li><li>Upload para storage</li><li>Agendamento por data</li><li>Google Analytics e eventos</li><li>Banco de dados e histórico</li></ul></section>
      </div>
    </section>
  );
}
